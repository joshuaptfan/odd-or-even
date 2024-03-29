var solo = false;
var ptDelta = (n => n === '\u221E' ? null : parseInt(n))(localStorage.ptDelta || 10);
var difficulty = {
	solo: parseInt(localStorage.difficulty || 0) % 3,
	versus: Math.trunc(parseInt(localStorage.difficulty || 0) / 3)
};
var handicap = 0;
var stats;
var currParity = 0;
var tutorialStep = null;
var buzzerLock = false;
var vibration = false;
var canWarnTouch = true;
var interval;
var installPrompt;

document.onreadystatechange = function () {
	const home = document.querySelector('.home');
	const setup = document.querySelector('.setup');
	const game = document.querySelector('.game');
	setup.querySelector('.num-points').textContent = ptDelta;
	setup.querySelector('.incr-points[value="-1"]').disabled = ptDelta === 5 ? true : false;
	setup.querySelector('.incr-points[value="1"]').disabled = !ptDelta ? true : false;
	if (parseInt(localStorage.colorBlind))
		game.classList.add('color-blind');

	home.addEventListener('touchstart', () => {
		home.removeEventListener('mousemove', warnTouch);
		home.classList.remove('warn-touch');
		canWarnTouch = false;
		home.querySelector('.warn').textContent = 'PORTRAIT ORIENTATION RECOMMENDED';
		warnPortrait();
	}, { once: true, passive: true });
	home.addEventListener('mousemove', warnTouch, { once: true });
	game.querySelector('.buzzer.solo').addEventListener('touchstart', e => buzz(e));
	game.querySelector('.buzzer.solo').addEventListener('click', e => buzz(e));
	game.querySelector('.buzzer.versus').addEventListener('touchstart', e => buzz(e));
	game.querySelector('.buzzer.versus').addEventListener('click', e => buzz(e));
	document.addEventListener('click', e => {
		if (e.target.classList.item(0) === 'select-bg') {
			e.target.style.display = 'none';
			setup.classList.remove('blur');
			document.querySelector('.back-btn').classList.remove('blur');
		}
		if (!/BUTTON|LABEL/.test(e.target.tagName)) return;
		switch (e.target.classList.item(0)) {
			case 'solo-btn':
				solo = true;
				buzzerLock = true;
				setup.classList.add('solo');
				game.classList.add('solo');
				setup.querySelector('[name="difficulty"][value="' + difficulty.solo + '"]').checked = true;
				changePage('.home', '.setup', 'left');
				break;
			case 'versus-btn':
				tutorialStep = null;
				setup.querySelector('[name="difficulty"][value="' + difficulty.versus + '"]').checked = true;
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
				setup.querySelector('.num-points').textContent = ptDelta;
				setup.querySelector('.incr-points[value="-1"]').disabled = ptDelta === 5 ? true : false;
				setup.querySelector('.incr-points[value="1"]').disabled = !ptDelta ? true : false;
				localStorage.ptDelta = ptDelta || '\u221E';
				break;
			case 'difficulty':
				difficulty[solo ? 'solo' : 'versus'] = parseInt(e.target.children[0].value);
				localStorage.difficulty = difficulty.versus * 3 + difficulty.solo;
				break;
			case 'handicap-btn':
				setup.classList.add('blur');
				document.querySelector('.back-btn').classList.add('blur');
				document.querySelector('.select-bg.handicap').style.display = 'block';
				break;
			case 'handicap':
				setHandicap(e.target);
				break;
			case 'start-btn':
				changePage('.setup', '.game', 'left');
				initGame();
				break;
			case 'share-btn':
				navigator.share({
					title: 'Odd or Even',
					text: 'Speed math game',
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
				solo = false;
				clearInterval(interval);
				game.querySelector('.menu-btn').classList.remove('opened');
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
			case 'vibration-btn':
				vibration = !vibration;
				game.querySelector('.settings').classList.toggle('vibration-on');
				localStorage.vibration = vibration ? 1 : 0;
				navigator.vibrate(vibration ? 5 : 0);
				break;
			case 'back-btn':
				switch (document.querySelector('.activated').classList.item(1)) {
					case 'setup':
						solo = false;
						game.classList.remove('solo');
						changePage('.setup', '.home', 'right');
						break;
					case 'about':
						changePage('.about', '.home', 'right');
						break;
					case 'game':
						tutorialStep = null;
						changePage('.game', '.home', 'right');
				}
		}
	});
	document.addEventListener('keydown', e => {
		if (!solo || buzzerLock) return;
		if (stats.l !== 0) {
			if (e.key === 'z')
				score(document.getElementById('odd'), 1);
			else if (e.key === 'x')
				score(document.getElementById('even'), 0);
		} else if (e.key === ' ')
			initGame();
	});
	document.addEventListener('animationend', e => {
		if (e.target.classList.contains('deactivated'))
			e.target.classList.remove('solo', 'activated', 'deactivated', 'fly-out-left', 'fly-out-right', 'tutorial', 'mark-up', 'mark-dn', 'game-over');
		else if (e.target.classList.contains('activated'))
			e.target.classList.remove('fly-in-left', 'fly-in-right');
		else if (e.target.classList.contains('running'))
			score(null, null);
		else if (e.target.classList.contains('expired')) {
			e.target.className = 'timer solo running';
			buzzerLock = false;
			genExpression();
		}
	});

	if (navigator.vibrate && /Android/.test(navigator.userAgent)) {
		vibration = parseInt(localStorage.vibration) || true;
		game.querySelector('.settings').classList.add('vibration-enabled', vibration ? 'vibration-on' : '');
	}

	fullscreen: if (!window.matchMedia('(display-mode: fullscreen)').matches && !navigator.standalone) {
		const about = document.querySelector('.about');
		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('beforeinstallprompt', e => {
			e.preventDefault();
			installPrompt = e;
			about.classList.add('auto');
		}, { once: true });
		window.addEventListener('appinstalled', () => {
			about.classList.remove('install');
		}, { once: true });
		about.classList.add('install', /^iP(hone|[ao]d)/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios' : 'android');
		if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) break fullscreen;
		home.querySelector('.fullscreen-btn').style.display = 'block';
		game.querySelector('.settings').classList.add('fullscreen-enabled');
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
		if (!document.fullscreenElement && !document.webkitFullscreenElement)
			(docEl.requestFullscreen || docEl.webkitRequestFullScreen).call(docEl);
		else
			(document.exitFullscreen || document.webkitExitFullscreen).call(document);
	}

	function warnTouch() {
		home.classList.add('warn-touch');
	}

	function warnPortrait() {
		if (canWarnTouch) return;
		if (window.innerWidth > window.innerHeight)
			home.classList.add('warn-portrait');
		else
			home.classList.remove('warn-portrait');
	}

	function setHandicap(el) {
		const handicapBtn = setup.querySelector('.handicap-btn');
		handicapBtn.classList.remove('uparr', 'dnarr');
		document.querySelector('.handicap[value="' + handicap + '"]').classList.remove('selected');
		handicap = parseFloat(el.value);
		handicapBtn.classList.add(el.classList.item(1));
		handicapBtn.textContent = el.textContent;
		el.classList.add('selected');
		document.querySelector('.select-bg.handicap').style.display = 'none';
		setup.classList.remove('blur');
		document.querySelector('.back-btn').classList.remove('blur');
	}

	function buzz(e) {
		if (!e.target.value && !buzzerLock) return;
		e.preventDefault();
		e.stopPropagation();
		if (buzzerLock) return;
		score(e.target, parseInt(e.target.value));
	}

	function resize() {
		document.querySelector(':root').style.fontSize = window.innerHeight * .01 + 'px';
		warnPortrait();
	}
};

function initTutorial() {
	buzzerLock = false;
	tutorialStep = 1;
	document.querySelector('.game').classList.add('tutorial');
	document.querySelector('.buzzer.versus').className = 'buzzer versus';
	setTutorialStep(0);
	initPlayers();
	genExpression();
}

function setTutorialStep(n) {
	tutorialStep += n;
	document.querySelector('.game').dataset.step = tutorials[tutorialStep - 1].s;
	document.querySelector('.game > progress').value = tutorialStep / tutorials.length;
	document.querySelector('.prev-btn').disabled = tutorialStep === 1;
	document.querySelector('.next-btn').disabled = tutorialStep === tutorials.length;
	document.querySelectorAll('.team').forEach(el => {
		el.dataset.text = tutorials[tutorialStep - 1].t;
	});
}

function initPlayers() {
	const side = Math.trunc(Math.random() * 2);
	const score = (s => handicap > 0 ? [s, 0] : [0, s])(Math.abs(handicap) * (ptDelta || 100));
	stats = [
		{ p: 0, pt: score[1 - side], t: 0, d: side ? 'up' : 'dn' },
		{ p: 1, pt: score[side], t: 0, d: side ? 'dn' : 'up' }
	];
	document.querySelector('.up > .name').textContent = side ? 'Even' : 'Odd';
	let point = document.querySelector('.up > .point');
	point.id = 'pt' + (side ? 0 : 1);
	point.textContent = score[0];
	document.querySelector('.dn > .name').textContent = side ? 'Odd' : 'Even';
	point = document.querySelector('.dn > .point');
	point.id = 'pt' + (side ? 1 : 0);
	point.textContent = score[1];

	document.querySelector('.lead').style.top = ((score[1] - score[0]) / (ptDelta || 100)) * 50 + 50 + '%';
}

function initGame() {
	const timer = document.querySelector('.timer.solo');
	const buzzer = document.querySelector('.buzzer' + (solo ? '.solo' : '.versus'));
	buzzerLock = true;
	document.querySelector('.game').classList.remove('game-over');
	if (solo) {
		stats = { pt: 0, t: 0, l: 0, st: 0, lst: 0 };
		document.querySelector('.score.solo > .point').textContent = 0;
		while (stats.l < 3)
			addLives(1);
		setTimer(0);
		timer.className = 'timer solo';
		void timer.offsetWidth;
		timer.classList.add('countdown');
		buzzer.className = 'buzzer solo';
	} else {
		initPlayers();
		buzzer.className = 'buzzer versus';
		void buzzer.offsetWidth;
		buzzer.classList.add('countdown');
	}
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
			if (solo) {
				timer.classList.remove('countdown');
				void timer.offsetWidth;
				timer.classList.add('running');
			} else
				buzzer.classList.remove('countdown');
			genExpression();
		}
	}, 1000);
}

function setTimer(t) {
	const timer = document.querySelector('.timer.solo');
	timer.style.width = (.98 ** t + 1) * 15 + 'rem';
	timer.style.animationDuration = .98 ** t + 1 + 's';
}

function addLives(n) {
	document.querySelector('.lives.solo > img:nth-of-type(' + Math.min(parseInt(stats.l + 1), 3) + ')').src = 'images/heart.svg#h' + parseInt(n < 0 ? 0 : 8);
	stats.l = Math.max(0, Math.min(stats.l + n, 3));
	if (stats.l === 3) return;
	document.querySelector('.lives.solo > img:nth-of-type(' + parseInt(stats.l + 1) + ')').src = 'images/heart.svg#h' + parseInt(stats.l % 1 * 8);
}

function score(el, val) {
	const game = document.querySelector('.game');
	if (solo) {
		const timer = game.querySelector('.timer.solo');
		const correct = val === currParity;
		stats.pt += correct ? 1 : 0;
		stats.st = correct ? stats.st + 1 : 0;
		stats.lst += stats.st > stats.lst ? 1 : 0;

		addLives(correct ? .125 : -1);
		game.querySelector('.score.solo > .point').textContent = stats.pt;
		timer.classList.remove('running');
		void timer.offsetWidth;
		if (stats.l === 0) {
			buzzerLock = true;
			setExpression('GAME OVER');
			game.classList.add('game-over');
			game.querySelector('.streak > .point').textContent = stats.lst;
			if (vibration)
				navigator.vibrate(20);
			setTimeout(() => {
				buzzerLock = false;
			}, 2000);
			return;
		}
		setTimer(++stats.t);
		if (el) {
			genExpression();
			timer.classList.add('running');
			el.classList.remove('neg', 'pos');
			void el.offsetWidth;
			el.classList.add(correct ? 'pos' : 'neg');
		} else {
			buzzerLock = true;
			setExpression(taunts[Math.trunc(Math.random() * 4)]);
			timer.classList.add('expired');
		}
		if (vibration && !correct)
			navigator.vibrate(5);
	} else {
		stats[currParity].pt += val;
		stats[currParity].t++;

		const point = game.querySelector('#pt' + currParity);
		point.textContent = stats[currParity].pt;
		point.dataset.value = stats[currParity].pt;
		point.classList.remove('flash', 'neg', 'pos');
		void point.offsetWidth;
		point.classList.add('flash', val < 0 ? 'neg' : 'pos');

		buzzerLock = true;
		const buzzer = game.querySelector('.buzzer.versus');
		game.querySelector('.lead').style.top = ((stats[0].pt - stats[1].pt) / (ptDelta || 100)) * (stats[0].d === 'up' ? -50 : 50) + 50 + '%';
		if (tutorialStep)
			game.classList.remove('mark-up', 'mark-dn');
		else if (Math.abs(stats[0].pt - stats[1].pt) === ptDelta) {
			setExpression((stats[0].pt > stats[1].pt ? 'EVEN' : 'ODD') + ' WINS');
			game.classList.add('game-over');
			setTimeout(() => {
				buzzerLock = false;
			}, 2000);
			return;
		}
		if (val > 0)
			buzzer.classList.add('pos');
		buzzer.classList.add('wave-' + stats[currParity].d);
		el.classList.add('active');
		setTimeout(() => {
			buzzerLock = false;
			buzzer.className = 'buzzer versus';
			el.classList.remove('active');
			genExpression();
		}, 750);
	}
}

function genExpression() {
	if (solo)
		currParity = Math.trunc(Math.random() * 2);
	else {
		// Choose player via random weighted by turns
		const sSort = [...stats].sort((a, b) => a.t - b.t);
		let rand = Math.random() * stats.reduce((s, v) => s + v.t + 7, 0);
		for (let i = 0; i < 2; i++) {
			rand -= sSort[i].t + 7;
			if (rand < 0) {
				currParity = 1 - sSort[i].p;
				break;
			}
		}
		if (tutorialStep)
			document.querySelector('.game').classList.add('mark-' + (stats[currParity].d));
	}

	// Generate expression
	const diff = difficulties[tutorialStep ? 0 : difficulty[solo ? 'solo' : 'versus']];
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
	flip: if (exP.reduce((p, v) => p + v.par & 1, 0) !== currParity) {
		const flipParity = i => ex[i].num += ex[i].par ? -1 : 1;
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
	}

	setExpression(ex.reduce((s, v) => s + ['', '+', '\u2212', '\xD7'][v.opr] + v.num, ''));
}

function setExpression(ex) {
	document.querySelectorAll('.expression' + (solo ? '.solo' : '.versus')).forEach(el => el.innerHTML = ex);
}
