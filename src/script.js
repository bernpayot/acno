const content = document.querySelector("#content");
const cursor = document.querySelector(".cursor");
const anchor = document.querySelector("#usc");
const randomOsuImages = [
	'2.avif',
	'3.avif',
];

const pageCache = new Map(); // mini cache for page renders

document.addEventListener("mousemove", (e) => {
	let x = e.clientX;
	let y = e.clientY;

	cursor.style.top = `${y}px`;
	cursor.style.left = `${x}px`;
});

document.addEventListener("mouseover", (e) => {
	if (e.target.closest("#usc")) {
		cursor.classList.add("hover");
	}
});

document.addEventListener("mouseout", (e) => {
	if (e.target.closest("#usc")) {
		cursor.classList.remove("hover")
	}
});

function setRandomOsuImage() {
    const image = document.querySelector(".homeosu img");

    if (!image) return;

    const random =
        randomOsuImages[Math.floor(Math.random() * randomOsuImages.length)];

    image.src = `osu/${random}`;
}

function getPageFromURL() {
	const path = window.location.pathname;

	return path === "/" ? "home" : path.slice(1);
}

async function loadPage(page, pushHistory = true) {
	try {
		let html = pageCache.get(page);

		if (!html) {
			const response = await fetch(`/pages/${page}.html`);

			if (!response.ok) {
				throw new Error(`Page "${page}" not found`);
			}

			html = await response.text();
			pageCache.set(page, html);
		}

		content.innerHTML = html;

		if (page === "home") {
			setRandomOsuImage();
		}

		updateActiveLink(page);

		if (pushHistory) {
			history.pushState(
				{ page },
				"",
				page === "home" ? "/" : `/${page}`
			);
		}
	} catch (error) {
		console.error(`Failed to load "${page}"`, error);

		content.innerHTML = `
			<p>
				Something went wrong while loading this page.
			</p>
		`;
	}

}

function updateActiveLink(page) {
	document.querySelectorAll("[data-page]").forEach(link => {
		link.classList.toggle(
			"active",
			link.dataset.page === page
		);
	});
}

document.querySelectorAll("[data-page]").forEach(link => {
	link.addEventListener("click", event => {
		event.preventDefault();

		loadPage(link.dataset.page);
	});
});

window.addEventListener("popstate", event => {
	const page = event.state?.page ?? getPageFromURL();

	loadPage(page, false);
});

loadPage(getPageFromURL(), false).catch(console.error);
