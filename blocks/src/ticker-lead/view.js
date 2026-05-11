/**
 * View-side IxAPI store for `mercantile/ticker-lead`.
 *
 * Click on the LIVE button pauses the ticker: state.isPaused flips true,
 * state.label swaps to STOP. A timer reverts both after state.pauseMs.
 * The sibling ticker-track stops its marquee via a CSS `:has()` rule
 * that reads `.mh-ticker__lead.is-paused` on the parent `.mh-ticker`
 * group — no cross-block messaging needed.
 */
import { store } from '@wordpress/interactivity';

const { state } = store( 'mercantile/ticker-lead', {
	state: {
		get label() {
			return state.isPaused ? 'STOP' : 'LIVE';
		},
	},
	actions: {
		togglePause() {
			if ( state.isPaused ) {
				return;
			}
			state.isPaused = true;
			const ms = Number( state.pauseMs ) || 5000;
			setTimeout( () => {
				state.isPaused = false;
			}, ms );
		},
	},
} );
