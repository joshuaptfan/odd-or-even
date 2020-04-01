var ptDelta = (n => n === '\u221E' ? null : parseInt(n))(localStorage.ptDelta || 10);
var difficulty = parseInt(localStorage.difficulty || 1);
var stats = [];
var currPlayer = 0;
var tutorialStep = null;
var buzzerLock = false;
var canWarnTouch = true;
var interval;
var installPrompt;

document.onreadystatechange = function () {
	const home = document.querySelector('.home');
	const game = document.querySelector('.game');
	document.querySelector('.num-points').textContent = ptDelta;
	document.querySelector('.incr-points[value="-1"]').disabled = ptDelta === 5 ? true : false;
	document.querySelector('.incr-points[value="1"]').disabled = !ptDelta ? true : false;
	document.querySelector('[name="difficulty"][value="' + difficulty + '"]').checked = true;
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
		buzz(e);
	});
	document.querySelector('.buzzer').addEventListener('click', e => {
		buzz(e);
	});
	document.addEventListener('click', e => {
		if (!/BUTTON|LABEL/.test(e.target.tagName)) return;
		switch (e.target.classList.item(0)) {
			case 'play-btn':
				tutorialStep = null;
				game.classList.remove('tutorial', 'mark-up', 'mark-dn');
				changePage(home.classList.contains('activated') ? '.home' : '.game', '.setup', 'left');
				break;
			case 'tutorial-btn':
				changePage('.home', '.game', 'left');
				initTutorial();
				break;
			case 'about-btn':
				changePage('.home', '.about', 'left');
				break;
			case 'fullscreen-btn':
				toggleFullscreen();
				break;
			case 'install-btn':
				installPrompt.prompt();
				break;
			case 'incr-points':
				const pd = [5, 10, 20, 30, 40, 50, null];
				ptDelta = pd[pd.indexOf(ptDelta) + parseInt(e.target.value)];
				document.querySelector('.num-points').textContent = ptDelta;
				document.querySelector('.incr-points[value="-1"]').disabled = ptDelta === 5 ? true : false;
				document.querySelector('.incr-points[value="1"]').disabled = !ptDelta ? true : false;
				localStorage.ptDelta = ptDelta || '\u221E';
				break;
			case 'difficulty':
				difficulty = parseInt(e.target.children[0].value);
				localStorage.difficulty = difficulty;
				break;
			case 'start-btn':
				changePage('.setup', '.game', 'left');
				initGame();
				break;
			case 'share-btn':
				navigator.share({
					title: 'Odd or Even',
					text: 'Multiplayer math game',
					url: 'https://oddoreven.app/'
				}).catch();
				break;
			case 'prev-btn':
				setTutorialStep(-1);
				break;
			case 'next-btn':
				setTutorialStep(1);
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
						tutorialStep = null;
						game.classList.remove('tutorial', 'mark-up', 'mark-dn');
						changePage('.game', '.home', 'right');
				}
		}
	});
	document.addEventListener('animationend', e => {
		if (e.target.classList.contains('deactivated'))
			e.target.classList.remove('activated', 'deactivated', 'fly-out-left', 'fly-out-right');
		else if (e.target.classList.contains('activated'))
			e.target.classList.remove('fly-in-left', 'fly-in-right');
	});

	fullscreen: if (!window.matchMedia('(display-mode: fullscreen)').matches && !navigator.standalone) {
		const about = document.querySelector('.about');
		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('beforeinstallprompt', e => {
			e.preventDefault();
			installPrompt = e;
			about.classList.add('auto');
		});
		window.addEventListener('appinstalled', () => {
			about.classList.remove('install');
		});
		about.classList.add('install', /^iP(hone|[ao]d)/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios' : 'android');
		if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) break fullscreen;
		home.querySelector('.fullscreen-btn').style.display = 'block';
		game.querySelector('.fullscreen-btn').style.display = 'block';
		game.querySelector('.color-blind-btn').style.marginTop = '119rem';
	}

	if (!navigator.share)
		document.querySelector('.share-btn').style.display = 'none';

	// Service worker caches page for offline use
	if (navigator.serviceWorker)
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

	function buzz(e) {
		if (!e.target.value && !buzzerLock) return;
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
	tutorialStep = 1;
	document.querySelector('.game').classList.add('tutorial');
	document.querySelector('.buzzer').className = 'buzzer';
	setTutorialStep(0);
	initPlayers();
	genExpression();
}

function setTutorialStep(n) {
	tutorialStep += n;
	document.querySelector('.game').dataset.step = tutorials[tutorialStep - 1].s;
	document.querySelector('.game > progress').value = tutorialStep / tutorials.length;
	document.querySelector('.prev-btn').disabled = tutorialStep === 1 ? true : false;
	document.querySelector('.next-btn').disabled = tutorialStep === tutorials.length ? true : false;
	document.querySelectorAll('.team').forEach(el => {
		el.dataset.text = tutorials[tutorialStep - 1].t;
	});
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

	document.querySelector('.lead').style.top = '50%';
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
	document.querySelector('.lead').style.top = ((stats[0].pt - stats[1].pt) / (ptDelta || 100)) * (stats[0].d === 'up' ? -50 : 50) + 50 + '%';
	if (tutorialStep)
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
	if (tutorialStep)
		document.querySelector('.game').classList.add('mark-' + (stats[currPlayer].d));

	// Generate expression
	const diff = difficulties[tutorialStep ? 0 : difficulty];
	let ex = [];
	const maxLen = Math.trunc(Math.random() * (diff.len - 1)) + 2;
	let remLen = maxLen;
	while (true) {
		// Generate operator and number
		const len = Math.trunc(Math.random() ** 3 * (maxLen - 1)) + 2;
		if (len > remLen) break;
		const opr = (r =>
			r < diff.oprs[0] ? (ex.length ? 1 : 0)
			: r < diff.oprs[1] ? 2
			: (ex.length ? 3 : 0)
		)(Math.random());
		const num = Math.trunc(Math.random() * 10 ** (len - 1));
		ex.push({ opr, num, par: num & 1 });
		remLen -= len;
	}

	// Calculate parity
	let exP = ex.map(o => Object.assign({}, o));
	// Reduce multiplications
	for (let i = 0; i < exP.length - 1; i++) {
		if (exP[i + 1].opr !== 3) continue;
		exP[i].par = exP[i].par && exP[i + 1].par ? 1 : 0;
		exP[i].len = (exP[i].len || 1) + 1;
		exP.splice(i-- + 1, 1);
	}
	// Reduce additions
	// If parity does not match current player, flip parity
	flip: if (exP.reduce((p, v) => p + v.par & 1, 0) !== currPlayer) {
		// Flip additive component if exists
		for (let i = 0; i < ex.length; i++) {
			if (ex[i].opr === 3 || ex[i + 1] && ex[i + 1].opr === 3) continue;
			flipParity(i);
			break flip;
		}
		// Flip multiplication group
		if (exP[0].par)
			flipParity(Math.trunc(Math.random() * exP[0].len));
		else
			for (let i = 0; i < exP[0].len; i++)
				ex[i].num += ex[i].par ? 0 : 1;

		function flipParity(i) {
			ex[i].num += ex[i].par ? -1 : 1;
		}
	}

	setExpression(ex.reduce((s, v) => s + ['', '+', '\u2212', '\xD7'][v.opr] + v.num, ''));
}

function setExpression(ex) {
	document.querySelectorAll('.expression').forEach(el => {
		el.innerHTML = ex;
	});
}
