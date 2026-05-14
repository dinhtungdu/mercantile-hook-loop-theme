/**
 * mercantile/pdp-codeblock — copy-shortcode easter egg.
 *
 * The dark `[mercantile id="…"]` codeblock below the PDP gallery has a
 * "copy shortcode ⟶" link. It looks like it ought to copy the shortcode
 * to the clipboard. It doesn't, and it never has — clicking it cycles a
 * random snark message for 3.2s before reverting. Ported from the
 * original prototype at
 * j111q.github.io/mercantile-prototype/explore/03-hook-loop/.
 *
 * Enqueued as the block's viewScript, so it loads only on pages that
 * render the codeblock — the standalone PDP and the PDP modal's iframe
 * (which loads the real product page). Delegated on document so it
 * catches `.mh-shortcode .copy` regardless of how the block got there.
 *
 * Each click picks a snark at random, avoiding repeats with the
 * *previous* one only — so a single PDP visit can cycle through most
 * messages without ever showing two in a row.
 */

/* global HTMLElement */

( function () {
	const DEFAULT_TEXT = 'copy shortcode ⟶';
	const REVERT_MS = 3200;

	const SNARKS = [
		'why are you trying to copy this, you weirdo? →',
		'ctrl+c ? ctrl-nope. →',
		'no clipboard. only vibes. →',
		"shortcodes don't work like that →",
		'forks and clones only, no copies →',
		'access denied, more wapuus needed →',
		'not today, scraper →',
		"did_action('cheeky_copy') = 1 →",
		'the wapuu union has been notified →',
		'404 / clipboard not found →',
	];

	// Track per-element state so multiple .copy elements (modal + direct)
	// don't fight over a shared timer / last-snark.
	const STATE = new WeakMap();

	function pickSnark( previous ) {
		const pool = SNARKS.filter( ( s ) => s !== previous );
		return pool[ Math.floor( Math.random() * pool.length ) ];
	}

	function snark( el ) {
		const prev = STATE.get( el ) || {};
		if ( prev.timer ) {
			clearTimeout( prev.timer );
		}
		const next = pickSnark( prev.last );
		el.textContent = next;
		el.classList.add( 'snarked' );
		const timer = setTimeout( () => {
			el.textContent = DEFAULT_TEXT;
			el.classList.remove( 'snarked' );
		}, REVERT_MS );
		STATE.set( el, { last: next, timer } );
	}

	function isCopy( target ) {
		if ( ! ( target instanceof HTMLElement ) ) {
			return null;
		}
		return target.closest( '.mh-shortcode .copy' );
	}

	document.addEventListener(
		'click',
		( event ) => {
			const el = isCopy( event.target );
			if ( ! el ) {
				return;
			}
			event.preventDefault();
			snark( el );
		},
		true
	);

	// Keyboard: Enter / Space on the `role="button"` copy link.
	document.addEventListener( 'keydown', ( event ) => {
		if ( event.key !== 'Enter' && event.key !== ' ' ) {
			return;
		}
		const el = isCopy( event.target );
		if ( ! el ) {
			return;
		}
		event.preventDefault();
		snark( el );
	} );
} )();
