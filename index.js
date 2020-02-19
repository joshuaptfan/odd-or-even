var ptDelta = (n => n === '\u221E' ? null : parseInt(n))(localStorage.ptDelta || 10);
var stats = [];
var currPlayer = 0;
var buzzerLock = false;
var isTutorial = true;
var canWarnTouch = true;
var interval;

document.onreadystatechange = function () {
	const home = document.querySelector('.home');
	const game = document.querySelector('.game');
	document.querySelector('.setup-num.points').textContent = ptDelta;
	if (parseInt(localStorage.colorBlind))
		game.classList.add('color-blind');

	home.addEventListener('touchstart', () => {
		home.removeEventListener('touchstart', arguments.callee);
		home.removeEventListener('mousemove', warnTouch);
		home.classList.remove('warn-touch');
		canWarnTouch = false;
		document.querySelector('.warn').textContent = 'PORTRAIT ORIENTATION RECOMMENDED';
		warnPortrait();
	}, { passive: true });
	home.addEventListener('mousemove', warnTouch);
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
			case 'about-btn':
				changePage('.home', '.about', 'left');
				break;
			case 'fullscreen-btn':
				toggleFullscreen();
				break;
			case 'incr':
				const pd = [5, 10, 20, 30, 40, 50, null];
				ptDelta = pd[(i => i < 0 ? 0 : i > 6 ? 6 : i)(pd.indexOf(ptDelta) + parseInt(e.target.value))];
				document.querySelector('.setup-num.points').textContent = ptDelta;
				localStorage.ptDelta = ptDelta || '\u221E';
				break;
			case 'ready-btn':
				changePage('.setup', '.game', 'left');
				initTutorial();
				break;
			case 'start-btn':
				isTutorial = false;
				game.classList.remove('tutorial', 'mark-up', 'mark-dn');
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
			case 'settings-btn':
			case 'close-btn':
				game.classList.toggle('settings');
				break;
			case 'color-blind-btn':
				game.classList.toggle('color-blind');
				localStorage.colorBlind = game.classList.contains('color-blind') ? 1 : 0;
				break;
			case 'back-btn':
				switch (document.querySelector('.activated').classList.item(1)) {
					case 'setup':
						changePage('.setup', '.home', 'right');
						break;
					case 'about':
						changePage('.about', '.home', 'right');
						break;
					case 'game':
						game.classList.remove('mark-up', 'mark-dn');
						changePage('.game', '.setup', 'right');
				}
		}
	});
	document.addEventListener('animationend', e => {
		if (e.target.classList.contains('deactivated'))
			e.target.classList.remove('activated', 'deactivated', 'fly-out-left', 'fly-out-right');
		else if (e.target.classList.contains('activated'))
			e.target.classList.remove('fly-in-left', 'fly-in-right');
	});

	if (!window.matchMedia('(display-mode: fullscreen)').matches && !navigator.standalone) {
		resize();
		window.addEventListener('resize', resize);
		if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) return;
		home.querySelector('.fullscreen-btn').style.display = 'block';
		game.querySelector('.fullscreen-btn').style.display = 'block';
		game.querySelector('.color-blind-btn').style.marginTop = '119rem';
	}

	// Service worker caches page for offline use
	if ('serviceWorker' in navigator)
		navigator.serviceWorker.register('/sw.js');

	function changePage(deactivated, activated, direction) {
		document.querySelector(deactivated).classList.add('deactivated', 'fly-out-' + direction);
		document.querySelector(activated).classList.add('activated', 'fly-in-' + direction);
	}

	function toggleFullscreen() {
		const docEl = document.documentElement;
		const requestFullscreen = docEl.requestFullscreen || docEl.webkitRequestFullScreen;
		const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
		if (!document.fullscreenElement && !document.webkitFullscreenElement)
			requestFullscreen.call(docEl);
		else
			exitFullscreen.call(document);
	}

	function warnTouch() {
		home.removeEventListener('mousemove', warnTouch);
		home.classList.add('warn-touch');
	}

	function warnPortrait() {
		if (canWarnTouch) return;
		if (window.innerWidth > window.innerHeight)
			home.classList.add('warn-portrait');
		else
			home.classList.remove('warn-portrait');
	}

	function buzz(e, touch) {
		if (!e.target.value && !buzzerLock) return;
		if (touch)
			e.preventDefault();
		e.stopPropagation();
		if (buzzerLock) return;
		score(e, parseInt(e.target.value));
	}

	function resize() {
		document.querySelector(':root').style.fontSize = window.innerHeight * .01 + 'px';
		warnPortrait();
	}
};

function initTutorial() {
	isTutorial = true;
	document.querySelector('.game').classList.add('tutorial');
	document.querySelector('.buzzer').className = 'buzzer';
	initPlayers();
	genExpression();
}

function initPlayers() {
	const rand = Math.trunc(Math.random() * 2);
	document.querySelector('.up > .player').textContent = rand ? 'Even' : 'Odd';
	let point = document.querySelector('.up > .point');
	point.id = 'pt' + (rand ? 0 : 1);
	point.textContent = 0;
	document.querySelector('.dn > .player').textContent = rand ? 'Odd' : 'Even';
	point = document.querySelector('.dn > .point');
	point.id = 'pt' + (rand ? 1 : 0);
	point.textContent = 0;
	stats = [
		{ p: 0, pt: 0, t: 0, d: rand ? 'up' : 'dn' },
		{ p: 1, pt: 0, t: 0, d: rand ? 'dn' : 'up' }
	];
}

function initGame() {
	initPlayers();
	buzzerLock = true;
	const buzzer = document.querySelector('.buzzer');
	buzzer.className = 'buzzer';
	void buzzer.offsetWidth;
	buzzer.classList.add('countdown');
	const countdown = countdowns[Math.trunc(Math.random() * countdowns.length)];
	let i = 0;
	setExpression(countdown[0]);
	clearInterval(interval);
	interval = setInterval(() => {
		if (++i < 3)
			setExpression(countdown[i]);
		else {
			clearInterval(interval);
			buzzerLock = false;
			buzzer.classList.remove('countdown');
			genExpression();
		}
	}, 1000);
}

function score(e, val) {
	stats[currPlayer].pt += val;
	stats[currPlayer].t++;

	const point = document.querySelector('#pt' + currPlayer);
	point.textContent = stats[currPlayer].pt;
	point.dataset.value = stats[currPlayer].pt;
	point.classList.remove('flash', 'neg', 'pos');
	void point.offsetWidth;
	point.classList.add('flash', val < 0 ? 'neg' : 'pos');

	buzzerLock = true;
	const buzzer = document.querySelector('.buzzer');
	if (isTutorial)
		document.querySelector('.game').classList.remove('mark-up', 'mark-dn');
	else if (Math.abs(stats[0].pt - stats[1].pt) === ptDelta) {
		setExpression((stats[0].pt > stats[1].pt ? 'EVEN' : 'ODD') + ' WINS');
		buzzer.classList.add('win');
		setTimeout(() => {
			buzzerLock = false;
		}, 2000);
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
	if (isTutorial)
		document.querySelector('.game').classList.add('mark-' + (stats[currPlayer].d));

	let ex = '';
	rand = Math.random();
	if (rand < .3) {
		// Generate number
		const numSize = [.033, .075, .122, .17, .215, .252, .276, .29, .3];
		let i = -1;
		while (rand > numSize[++i]);
		ex += (Math.random() * 10 ** i & 0x7FFFFFFE) + currPlayer;
	} else {
		// Generate additive expression
		let numNums = Math.ceil(Math.random() * 4);
		let sum = 0;
		while (numNums--) {
			let num = Math.trunc(Math.random() * 19) - 9;
			sum += num;
			ex += (num < 0 ? '\u2212' : ex ? '+' : '') + Math.abs(num);
		}
		ex += (n => !n ? '' : (n < 0 ? '\u2212' : '+') + Math.abs(n))((currPlayer - sum % 2) + (Math.random() * 17 & 0xFE) - 8);
	}
	setExpression(!isTutorial ? ex : ex.replace(/[13579](?=\D|$)/gu, '<u>$&</u>'));
}

function setExpression(ex) {
	document.querySelectorAll('.expression').forEach(el => {
		el.innerHTML = ex;
	});
}
