let cache: Cache | undefined;

async function getCache() {
	return cache ||= await caches.open("TTS");
}

export async function cachedFetch(request: RequestInfo | URL, init?: RequestInit) {
	const cache = await getCache();
	let response = await cache.match(request);
	if (!response) {
		response = await fetch(request, init);
		if (response.ok) await cache.put(request, response.clone());
	}
	return response;
}
