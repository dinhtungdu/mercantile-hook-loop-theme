/**
 * Mercantile Hook Loop — in-place catalog filter swap.
 *
 * The catalog filter chips in section-head are <a> links to category
 * archives (e.g. /product-category/apparel/). By default each click is
 * a full page navigation that resets the user's scroll position.
 *
 * This script intercepts those clicks, fetches the destination, and
 * swaps in just the products grid + section-head label without touching
 * scroll position. Falls back to native navigation if JS is disabled
 * or fetch fails.
 *
 * Modifier-clicks (cmd/ctrl/shift/alt) and target=_blank links pass
 * through to native handling.
 */
( function () {
	'use strict';

	if ( ! document.querySelector( '.mh-filters' ) ) {
		return;
	}

	var FILTER_LINK = '.mh-filters .mh-filter';
	var GRID_WRAP   = '.mh-grid-wrap';
	var LABEL       = '.mh-section-head__label';

	function pathname( href ) {
		try {
			return new URL( href, location.origin ).pathname;
		} catch ( e ) {
			return href;
		}
	}

	function setActive( href ) {
		var target = pathname( href );
		document.querySelectorAll( FILTER_LINK ).forEach( function ( a ) {
			a.classList.toggle( 'is-on', pathname( a.href ) === target );
		} );
	}

	function swapTo( url, push ) {
		var gridWrap = document.querySelector( GRID_WRAP );
		if ( ! gridWrap ) {
			return;
		}

		// Optimistic active-state update for tactile feedback
		setActive( url );

		// Subtle fade while we wait
		gridWrap.style.transition = 'opacity 0.12s ease';
		gridWrap.style.opacity     = '0.4';

		fetch( url, { credentials: 'same-origin' } )
			.then( function ( r ) {
				if ( ! r.ok ) {
					throw new Error( 'fetch failed' );
				}
				return r.text();
			} )
			.then( function ( html ) {
				var doc      = new DOMParser().parseFromString( html, 'text/html' );
				var newGrid  = doc.querySelector( GRID_WRAP );
				var newLabel = doc.querySelector( LABEL );
				var newTitle = doc.querySelector( 'title' );

				if ( ! newGrid ) {
					throw new Error( 'no grid in response' );
				}

				gridWrap.innerHTML        = newGrid.innerHTML;
				gridWrap.style.opacity    = '';
				gridWrap.style.transition = '';

				if ( newLabel ) {
					var currentLabel = document.querySelector( LABEL );
					if ( currentLabel ) {
						currentLabel.textContent = newLabel.textContent;
					}
				}

				if ( newTitle ) {
					document.title = newTitle.textContent;
				}

				if ( push ) {
					history.pushState( { mhFilter: true }, '', url );
				}
			} )
			.catch( function () {
				// Fall back to full nav on any error
				location.href = url;
			} );
	}

	document.addEventListener( 'click', function ( e ) {
		var a = e.target.closest( FILTER_LINK );
		if ( ! a ) {
			return;
		}
		// Let modifier-clicks open in new tabs / windows natively
		if ( e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ) {
			return;
		}
		if ( a.target === '_blank' ) {
			return;
		}
		e.preventDefault();
		swapTo( a.href, true );
	} );

	window.addEventListener( 'popstate', function ( e ) {
		// Only handle pops we created (don't interfere with other history entries)
		if ( e.state && e.state.mhFilter ) {
			swapTo( location.href, false );
		}
	} );
} )();
