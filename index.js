var ptDelta = (n => n === '\u221E' ? null : parseInt(n))(localStorage.ptDelta || 20);
var stats = [];
var currPlayer = 0;
var buzzerLock = true;
var timeout;

document.onreadystatechange = function () {
	document.querySelector(':root').style.fontSize = window.innerHeight * .01 + 'px';
	document.querySelector('.setup-num.points').textContent = ptDelta;
	document.querySelector('#color-blind').checked = parseInt(localStorage.colorBlind) ? true : false;

	document.querySelector('.buzzer').addEventListener('touchstart', e => {
		buzz(e, true);
	});
	document.querySelector('.buzzer').addEventListener('mousedown', e => {
		buzz(e, false);
	});
	document.addEventListener('click', e => {
		if (!/BUTTON|LABEL/.test(e.target.tagName)) return;
		switch (e.target.classList.item(0)) {
			case 'play-btn':
				changePage('.home', '.setup', 'left');
				break;
			case 'tutorial-btn':
				changePage('.home', '.tutorial', 'left');
				break;
			case 'about-btn':
				changePage('.home', '.about', 'left');
				break;
			case 'incr':
				const pd = [10, 20, 30, 40, 50, 60, null];
				ptDelta = pd[(i => i < 0 ? 0 : i > 6 ? 6 : i)(pd.indexOf(ptDelta) + parseInt(e.target.value))];
				document.querySelector('.setup-num.points').textContent = ptDelta;
				localStorage.ptDelta = ptDelta || '\u221E';
				break;
			case 'start-btn':
				changePage('.setup', '.game', 'left');
				initGame();
				break;
			case 'menu-btn':
				e.target.classList.toggle('opened');
				break;
			case 'restart-btn':
				initGame();
				break;
			case 'home-btn':
				document.querySelector('.menu-btn').classList.remove('opened');
				changePage('.game', '.home', 'right');
				break;
			case 'color-blind-btn':
				localStorage.colorBlind = document.querySelector('#color-blind').checked ? 0 : 1;
				break;
			case 'back-btn':
				switch (document.querySelector('.activated').classList.item(1)) {
					case 'setup':
						changePage('.setup', '.home', 'right');
						break;
					case 'tutorial':
						changePage('.tutorial', '.home', 'right');
						break;
					case 'about':
						changePage('.about', '.home', 'right');
				}
		}
	});
	document.addEventListener('animationend', e => {
		if (e.target.classList.contains('deactivated'))
			e.target.classList.remove('activated', 'deactivated', 'fly-out-left', 'fly-out-right');
		else if (e.target.classList.contains('activated'))
			e.target.classList.remove('fly-in-left', 'fly-in-right');
	});
	window.addEventListener('resize', () => {
		document.querySelector(':root').style.fontSize = window.innerHeight * .01 + 'px';
	});

	// Service worker caches page for offline use
	if ('serviceWorker' in navigator)
		navigator.serviceWorker.register('/sw.js');

	function buzz(e, touch) {
		if (buzzerLock || !e.target.value) return;
		if (touch)
			e.preventDefault();
		score(e, parseInt(e.target.value));
	}
};

function changePage(deactivated, activated, direction) {
	document.querySelector(deactivated).classList.add('deactivated', 'fly-out-' + direction);
	document.querySelector(activated).classList.add('activated', 'fly-in-' + direction);
}

function initGame() {
	const rand = Math.floor(Math.random() * 2);
	document.querySelector('.up > .player').textContent = rand ? 'Even' : 'Odd';
	let point = document.querySelector('.up > .point');
	point.textContent = 0;
	point.id = 'pt' + (rand ? 0 : 1);
	document.querySelector('.dn > .player').textContent = rand ? 'Odd' : 'Even';
	point = document.querySelector('.dn > .point');
	point.textContent = 0;
	point.id = 'pt' + (rand ? 1 : 0);
	stats = [
		{ p: 0, pt: 0, t: 0, d: rand ? 'up' : 'dn' },
		{ p: 1, pt: 0, t: 0, d: rand ? 'dn' : 'up' }
	];

	buzzerLock = true;
	const buzzer = document.querySelector('.buzzer');
	buzzer.className = 'buzzer';
	void buzzer.offsetWidth;
	buzzer.classList.add('countdown');
	document.querySelectorAll('.buzzer > button').forEach(el => {
		el.classList.remove('active');
	});
	document.querySelectorAll('.expression').forEach(el => {
		el.textContent = '\u2026';
	});
	clearTimeout(timeout);
	timeout = setTimeout(() => {
		buzzerLock = false;
		buzzer.classList.remove('countdown');
		genExpression();
	}, 3000);
}

function score(e, val) {
	stats[currPlayer].pt += val;
	stats[currPlayer].t++;
	document.querySelector('#pt' + currPlayer).textContent = stats[currPlayer].pt;

	buzzerLock = true;
	const buzzer = document.querySelector('.buzzer');
	if (Math.abs(stats[0].pt - stats[1].pt) === ptDelta) {
		document.querySelectorAll('.expression').forEach(el => {
			el.textContent = (stats[0].pt > stats[1].pt ? 'Even' : 'Odd') + ' Wins!';
		});
		buzzer.classList.add('win');
		document.querySelector('.menu-btn').classList.add('opened');
		return;
	}
	if (val > 0)
		buzzer.classList.add('pos');
	buzzer.classList.add('wave-' + stats[currPlayer].d);
	e.target.classList.add('active');
	setTimeout(() => {
		buzzerLock = false;
		buzzer.className = 'buzzer';
		e.target.classList.remove('active');
		genExpression();
	}, 750);
}

function genExpression() {
	// Choose player via random weighted by turns
	const sSort = [...stats].sort((a, b) => a.t - b.t);
	let rand = Math.random() * stats.reduce((s, v) => s + v.t + 7, 0);
	for (let i = 0; i < 2; i++) {
		rand -= sSort[i].t + 7;
		if (rand < 0) {
			currPlayer = 1 - sSort[i].p;
			break;
		}
	}

	let ex = '';
	rand = Math.random();
	if (rand < .3) {
		// Generate number
		const numSize = [.033, .075, .122, .17, .215, .252, .276, .29, .3];
		let i = -1;
		while (rand > numSize[++i]);
		ex = (Math.random() * 10 ** i & 0x7FFFFFFE) + currPlayer;
	} else {
		// Generate additive expression
		let numNums = Math.ceil(Math.random() * 4);
		let sum = 0;
		while (numNums--) {
			let num = Math.floor(Math.random() * 19) - 9;
			sum += num;
			ex += (num < 0 ? '\u2212' : ex ? '+' : '') + Math.abs(num);
		}
		ex += (n => !n ? '' : (n < 0 ? '\u2212' : '+') + Math.abs(n))((currPlayer - sum % 2) + Math.floor(Math.random() * 8) * 2 - 8);
	}

	document.querySelectorAll('.expression').forEach(el => {
		el.textContent = ex;
	});
}
