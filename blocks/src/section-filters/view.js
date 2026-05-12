/**
 * View-side iAPI store for the catalog surface (`mercantile/catalog`).
 *
 * Powers the section-filters chips: chip clicks swap the
 * `mercantile/catalog-grid` router region without a full page reload.
 *
 * - `navigate`: triggered on chip click. Calls the iAPI router so
 *   matching router regions on the destination URL replace the current
 *   ones. Modifier-clicks (cmd/ctrl/shift/alt, middle button) fall
 *   through to the browser's default so "open in new tab" still works.
 * - `prefetch`: triggered on chip hover. Warms the router cache so the
 *   click is instant.
 */
import { store, withSyncEvent } from '@wordpress/interactivity';

const isModifierClick = ( event ) =>
	event.metaKey ||
	event.ctrlKey ||
	event.shiftKey ||
	event.altKey ||
	event.button !== 0;

store( 'mercantile/catalog', {
	actions: {
		navigate: withSyncEvent( function* ( event ) {
			if ( isModifierClick( event ) ) {
				return;
			}
			event.preventDefault();
			const href = event.currentTarget?.href;
			if ( ! href ) {
				return;
			}
			const { actions } = yield import(
				'@wordpress/interactivity-router'
			);
			yield actions.navigate( href );
		} ),
		*prefetch( event ) {
			const href = event.currentTarget?.href;
			if ( ! href ) {
				return;
			}
			const { actions } = yield import(
				'@wordpress/interactivity-router'
			);
			yield actions.prefetch( href );
		},
	},
} );
