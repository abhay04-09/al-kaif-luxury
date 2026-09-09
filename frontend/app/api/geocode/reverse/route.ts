import { NextResponse } from "next/server";

/**
 * Turns a pair of coordinates into an address, via OpenStreetMap's Nominatim.
 *
 * This runs on the server rather than in the client's browser for one blunt
 * reason: Nominatim's usage policy requires an identifying User-Agent, and
 * browsers forbid setting that header — fetch drops it silently. A request made
 * from the browser cannot comply, and Nominatim enforces its policy by blocking.
 *
 * Going through here also means their one-request-a-second limit is honoured in
 * a single place instead of being trusted to every visitor, and if we are ever
 * throttled it is one server with a contact address rather than our clients'
 * own IPs.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";

// Nominatim asks for an identifying agent with a way to reach us.
const USER_AGENT = "AL-KAIF-Storefront/1.0 (https://www.alkaif.in; info@alkaif.in)";

// Their policy is one request a second, absolute maximum.
const MIN_GAP_MS = 1100;
const UPSTREAM_TIMEOUT_MS = 5000;

let lastCallAt = 0;

// Coordinates rounded to about eleven metres. A client pressing the button
// twice from the same spot is answered from here rather than upstream.
const cache = new Map<string, { at: number; body: unknown }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLat = url.searchParams.get("lat");
  const rawLon = url.searchParams.get("lon");
  const lat = Number(rawLat);
  const lon = Number(rawLon);

  // Missing parameters would otherwise read as zero, which is a real place in
  // the Gulf of Guinea and not where anyone is standing.
  if (
    rawLat === null ||
    rawLon === null ||
    rawLat.trim() === "" ||
    rawLon.trim() === "" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    return NextResponse.json(
      { error: "Those coordinates do not look right." },
      { status: 400 }
    );
  }

  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.body);
  }

  // Space the calls out rather than firing and being blocked.
  const since = Date.now() - lastCallAt;
  if (since < MIN_GAP_MS) await wait(MIN_GAP_MS - since);
  lastCallAt = Date.now();

  const query = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lon),
    zoom: "18", // building level
    addressdetails: "1"
  });

  try {
    const upstream = await fetch(`${NOMINATIM}?${query}`, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en",
        Referer: "https://www.alkaif.in"
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "The address lookup is busy. Please type your address." },
        { status: 502 }
      );
    }

    const data = (await upstream.json()) as {
      address?: Record<string, string>;
      display_name?: string;
    };
    const parts = data.address ?? {};

    // Nominatim names the same thing differently depending on where you are.
    const street = [parts.house_number, parts.road].filter(Boolean).join(" ");
    const area =
      parts.neighbourhood ?? parts.suburb ?? parts.village ?? parts.hamlet ?? "";
    const city =
      parts.city ??
      parts.town ??
      parts.municipality ??
      parts.state_district ??
      parts.county ??
      "";

    const body = {
      // Deliberately not a complete address: a satellite fix knows the street,
      // never the flat. The client must finish this themselves.
      street: [street, area].filter(Boolean).join(", "),
      city,
      state: parts.state ?? "",
      // Indian postcodes are patchy in OpenStreetMap. An empty one is honest;
      // a guessed one misroutes the parcel and misprices the delivery.
      pincode: /^\d{6}$/.test(parts.postcode ?? "") ? parts.postcode : "",
      displayName: data.display_name ?? ""
    };

    cache.set(key, { at: Date.now(), body });
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: "We could not look that up. Please type your address." },
      { status: 502 }
    );
  }
}
