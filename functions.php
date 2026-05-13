<?php
/**
 * Mercantile Hook Loop bootstrap.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'editor-styles' );
		add_editor_style( 'style.css' );

		// Declare WooCommerce block-theme support so WC ships its block templates.
		// The classic gallery zoom/lightbox/slider supports are intentionally NOT added —
		// the theme uses the block-based woocommerce/product-gallery block instead.
		add_theme_support( 'woocommerce' );
	}
);

/**
 * Register theme-local blocks. Source lives in blocks/src/<slug>/ (JSX
 * + block.json + render.php) and is compiled by `pnpm build` into
 * blocks/build/<slug>/, which is what we register from. Discovery is
 * filesystem-driven: every block.json under blocks/build is registered,
 * so adding a block is just `mkdir blocks/src/<slug> && pnpm build` —
 * no second edit here. The build directory is .gitignored — run
 * `pnpm install && pnpm build` after a fresh checkout before
 * activating the theme.
 */
add_action(
	'init',
	function () {
		$blocks_dir = get_theme_file_path( 'blocks/build' );
		if ( ! is_dir( $blocks_dir ) ) {
			return;
		}
		foreach ( glob( $blocks_dir . '/*/block.json' ) as $block_json ) {
			register_block_type( dirname( $block_json ) );
		}
	}
);

add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style(
			'mercantile-hook-loop-fonts',
			'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=UnifrakturCook:wght@700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap',
			array(),
			null
		);

		wp_enqueue_style(
			'mercantile-hook-loop-style',
			get_stylesheet_uri(),
			array( 'mercantile-hook-loop-fonts' ),
			wp_get_theme()->get( 'Version' )
		);
	}
);

/**
 * Register and enqueue the PDP modal script as an Interactivity API
 * client-side module, plus seed translatable loading labels into the iAPI
 * config. Triggered globally so a click on any product link (catalog cell,
 * related-products row) opens the product in a modal instead of full-page
 * navigation.
 *
 * Loading labels flow through `wp_interactivity_config()` rather than the JS
 * `__()` runtime (CLAUDE.md note 19/20: static values use config, reactive
 * values use state). The JS picks one at random per open via `getConfig()`.
 *
 * Direct loads of /product/<slug> still render the page normally; the
 * modal scaffold (injected on wp_footer below) sits dormant via the
 * `hidden` attribute on its root until the iAPI store flips `state.isOpen`.
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		if ( ! function_exists( 'wp_enqueue_script_module' ) ) {
			return;
		}
		wp_enqueue_script_module(
			'mercantile-hook-loop/pdp-modal',
			get_template_directory_uri() . '/assets/js/pdp-modal.js',
			array( '@wordpress/interactivity', '@wordpress/interactivity-router' ),
			wp_get_theme()->get( 'Version' )
		);
		if ( function_exists( 'wp_interactivity_config' ) ) {
			wp_interactivity_config(
				'mercantile/pdp-modal',
				array(
					'loadingLabels' => array(
						__( 'compiling…', 'mercantile-hook-loop' ),
						__( 'unwrapping it…', 'mercantile-hook-loop' ),
						__( 'running the_content()…', 'mercantile-hook-loop' ),
						__( 'pulling from wp-content/merch…', 'mercantile-hook-loop' ),
						__( 'polishing the kerning…', 'mercantile-hook-loop' ),
						__( 'committing markup…', 'mercantile-hook-loop' ),
						__( 'wapuu woke up…', 'mercantile-hook-loop' ),
						__( "did_action( 'preview' )…", 'mercantile-hook-loop' ),
						__( 'fetching, gently…', 'mercantile-hook-loop' ),
					),
				)
			);
		}
	}
);

/**
 * Wrap every page's body content in a router region so the Interactivity
 * Router can swap pages without a real navigation. The open tag goes in
 * `wp_body_open` (right after admin bar) and the close tag rides early on
 * `wp_footer` so the modal scaffold below ends up OUTSIDE the region —
 * the modal must stay mounted across navigations.
 *
 * Same id on every template, so navigating catalog → product (or
 * product → product) finds a matching region in the response and swaps
 * its content. Templates with no header/footer (single-product.html)
 * naturally render an empty header/footer area inside the region; the
 * router does a one-shot DOM swap and the new content takes over.
 */
add_action(
	'wp_body_open',
	function () {
		if ( is_admin() ) {
			return;
		}
		echo '<div data-wp-router-region="mercantile/page">';
	}
);
add_action(
	'wp_footer',
	function () {
		if ( is_admin() ) {
			return;
		}
		echo '</div>';
	},
	0
);

/**
 * Loading overlay shown while the router fetches the destination page.
 *
 * Clicking a product link triggers actions.open(), which (1) flips
 * state.isLoading to true, revealing this overlay with a Wapuu ASCII
 * reveal animation, (2) calls the router's `navigate` action, then (3)
 * clears state.isLoading once the swap completes. The scrim is opaque
 * and the loading card sits at the same top position as `.mh-pdp`, so
 * the moment of swap is invisible — only the card contents change.
 *
 * The scaffold lives OUTSIDE the router region (the region closes at
 * priority 0 above) so this element survives every navigation.
 */
add_action(
	'wp_footer',
	function () {
		if ( is_admin() ) {
			return;
		}
		?>
		<div
			class="mh-pdp-modal"
			data-wp-interactive="mercantile/pdp-modal"
			data-wp-class--is-loading="state.isLoading"
			data-wp-bind--hidden="!state.isLoading"
			hidden
		>
			<div class="mh-pdp-modal__scrim"></div>
			<div class="mh-pdp-modal__loading">
				<pre class="mh-wapuu-ascii" aria-hidden="true"></pre>
				<span class="mh-pdp-modal__loading-line" data-wp-text="state.loadingText"></span>
			</div>
		</div>
		<?php
	}
);

/**
 * Tag the catalog grid wrapper as an Interactivity API router region so
 * chip clicks (mercantile/section-filters) can swap the grid in place
 * instead of full-page reloading.
 *
 * `core/group`'s save() only emits class/style/id, so adding `data-wp-*`
 * inline in the template HTML triggers a block-validation error. The
 * render-time filter is the supported escape hatch for surface-only
 * attributes that don't belong in an attribute schema.
 *
 * Matches the `.mh-grid-wrap` group emitted by index.html (and the
 * archive/taxonomy/search templates that mirror it).
 */
add_filter(
	'render_block_core/group',
	function ( $block_content, $block ) {
		if ( ! is_string( $block_content ) ) {
			return $block_content;
		}
		$class = $block['attrs']['className'] ?? '';
		if ( false === strpos( $class, 'mh-grid-wrap' ) ) {
			return $block_content;
		}
		$p = new WP_HTML_Tag_Processor( $block_content );
		if ( $p->next_tag( 'div' ) ) {
			$p->set_attribute( 'data-wp-interactive', 'mercantile/catalog' );
			$p->set_attribute( 'data-wp-router-region', 'mercantile/catalog-grid' );
		}
		return $p->get_updated_html();
	},
	10,
	2
);

/**
 * Wire every product link inside a wc:product-collection to show the
 * loading overlay and navigate to the product page. Covers catalog grids
 * (home / archive / search) and the related-products sidebar on the
 * single-product template.
 *
 * The fully-qualified namespace form (`mercantile/pdp-modal::callbacks.…`)
 * lets the iAPI runtime resolve the store without `data-wp-interactive` on
 * an ancestor. Modifier-clicks (cmd/ctrl/shift/alt) and `target="_blank"`
 * fall through to native navigation.
 */
add_filter(
	'render_block_woocommerce/product-collection',
	function ( $block_content ) {
		if ( ! is_string( $block_content ) ) {
			return $block_content;
		}
		$p = new WP_HTML_Tag_Processor( $block_content );
		while ( $p->next_tag( 'a' ) ) {
			$href = $p->get_attribute( 'href' );
			if ( is_string( $href ) && false !== strpos( $href, '/product/' ) ) {
				$p->set_attribute( 'data-wp-on--click', 'mercantile/pdp-modal::callbacks.openFromLink' );
			}
		}
		return $p->get_updated_html();
	}
);

/**
 * Re-label a few WooCommerce Checkout step headings to match the
 * Mercantile prototype (Contact / Shipping address / Payment).
 */
add_filter(
	'gettext_woocommerce',
	function ( $translation, $text ) {
		switch ( $text ) {
			case 'Contact information':
				return 'Contact';
			case 'Billing address':
			case 'Billing':
				return 'Shipping address';
			case 'Payment options':
				return 'Payment';
		}
		return $translation;
	},
	10,
	2
);

// `enqueue_block_assets` (unlike `enqueue_block_editor_assets`) fires inside
// the editor iframe — where the canvas actually renders — so the Google Fonts
// stylesheet reaches the document that needs the @font-face rules. Guarded
// with `is_admin()` because the same hook also fires on the front-end, where
// `wp_enqueue_scripts` already loads the font.
add_action(
	'enqueue_block_assets',
	function () {
		if ( ! is_admin() ) {
			return;
		}
		wp_enqueue_style(
			'mercantile-hook-loop-fonts-editor',
			'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=UnifrakturCook:wght@700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap',
			array(),
			null
		);
	}
);

/**
 * `[mh_product_attributes]` — render the WooCommerce product attributes
 * table inline.
 *
 * WooCommerce ships `wc_display_product_attributes()` which outputs
 * `<table class="shop_attributes">` with one row per visible attribute
 * (plus weight/dimensions if set). It's normally only called inside the
 * "Additional information" tab on the single-product page.
 *
 * Expose it as a shortcode so the PDP template can render attributes as
 * labeled spec rows in the sidebar Details panel, without the tabs UI.
 * Restyled in style.css to match the .mh-pdp__spec-row rhythm.
 *
 * Returns empty string off-product, so accidental placement on other
 * pages renders nothing instead of erroring.
 */
add_shortcode(
	'mh_product_attributes',
	function () {
		global $product;
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return '';
		}
		ob_start();
		wc_display_product_attributes( $product );
		return ob_get_clean();
	}
);

add_action(
	'wp_enqueue_scripts',
	function () {
		// "copy →" link on the dark [mercantile id="…"] PDP codeblock —
		// never actually copies; cycles snark messages for 3.2s.
		wp_enqueue_script(
			'mercantile-hook-loop-copy-easter-egg',
			get_template_directory_uri() . '/assets/js/copy-easter-egg.js',
			array(),
			wp_get_theme()->get( 'Version' ),
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);
	}
);

/* -----------------------------------------------------------------------
 * Prototype-chrome shortcodes.
 *
 * The PDP and shop-head designs mimic the WordPress editor's Publish
 * meta-box, breadcrumb, permalink row, and category-filter chips. The
 * original templates rendered those bits as static `wp:html` blocks with
 * hard-coded copy ("post.php?action=edit", "all 17", "permalink:
 * http://localhost:8883/product/slug · modified just now") so they
 * looked design-correct on screenshots but lied about real product
 * state. These shortcodes generate the same markup from real WC data,
 * so the design is preserved and the content tells the truth.
 * -------------------------------------------------------------------- */

/**
 * `[mh_pdp_breadcrumb]` — mercantile / shop / <category> / <title>
 *
 * Matches the design of the static breadcrumb that used to live in the
 * PDP header. "mercantile" links to home, "shop" links to the shop
 * page, the category links to the category archive, and the product
 * title is rendered as bold non-link text (we're already on its page).
 * The close × button uses the iAPI `mercantile/pdp-modal::actions.close`
 * action (fully-qualified form so no `data-wp-interactive` ancestor is
 * needed). JS navigates back via `history.back()` with a homepage
 * fallback; the no-JS fallback is the shop page href.
 */
add_shortcode(
	'mh_pdp_breadcrumb',
	function () {
		global $product;
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return '';
		}
		$shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
		$cat_html = '';
		$terms    = get_the_terms( $product->get_id(), 'product_cat' );
		if ( $terms && ! is_wp_error( $terms ) ) {
			$primary = reset( $terms );
			$cat_html = sprintf(
				'<a href="%s">%s</a><span class="sl">/</span>',
				esc_url( get_term_link( $primary ) ),
				esc_html( strtolower( $primary->name ) )
			);
		}
		return sprintf(
			'<header class="mh-pdp__header" data-wp-interactive="mercantile/pdp-modal"><div class="mh-pdp__crumb"><a href="%s">mercantile</a><span class="sl">/</span><a href="%s">shop</a><span class="sl">/</span>%s<b>%s</b></div><button class="mh-pdp__close" type="button" aria-label="%s" data-wp-on--click="actions.close">&times;</button></header>',
			esc_url( home_url( '/' ) ),
			esc_url( $shop_url ),
			$cat_html,
			esc_html( strtolower( $product->get_name() ) ),
			esc_attr__( 'Go back', 'mercantile-hook-loop' )
		);
	}
);

/**
 * `[mh_pdp_permalink]` — permalink: <site>/product/<slug> · modified <date>
 *
 * Replaces the static "permalink: http://localhost:8883/product/slug ·
 * modified just now" line. Splits the URL at the slug so the slug can
 * be highlighted blue (matching the prototype's editor-style URL row),
 * and renders the real last-modified time as a human-readable diff
 * ("3 days ago"). On the index page (no product context) returns empty.
 */
add_shortcode(
	'mh_pdp_permalink',
	function () {
		global $product;
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return '';
		}
		$permalink = get_permalink( $product->get_id() );
		$slug      = basename( untrailingslashit( $permalink ) );
		// Everything up to (and including) /product/ — strip the slug off the end.
		$prefix    = substr( $permalink, 0, strrpos( untrailingslashit( $permalink ), '/' ) + 1 );

		$modified  = get_post_modified_time( 'U', true, $product->get_id() );
		$diff      = human_time_diff( $modified, current_time( 'timestamp', true ) );

		return sprintf(
			'<div class="mh-pdp__permalink">permalink: <span class="k">%s</span><b class="hl-blue">%s</b><span class="mh-pdp__permalink-meta">&middot; modified %s ago</span></div>',
			esc_html( $prefix ),
			esc_html( $slug ),
			esc_html( $diff )
		);
	}
);

/**
 * `[mh_pdp_publish_meta]` — the Publish meta-box mimic in the sidebar.
 *
 * Renders three status rows (status / visibility / stock) with REAL
 * values: post_status, catalog_visibility, and stock_status. The
 * design treats this as a wp-admin Publish meta-box reference, so the
 * presence of the panel is intentional — only the values were stale.
 */
add_shortcode(
	'mh_pdp_publish_meta',
	function () {
		global $product;
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return '';
		}

		$status      = get_post_status( $product->get_id() );
		$status_dot  = 'publish' === $status ? 'g' : ''; // green dot when published
		$status_text = 'publish' === $status ? 'published' : esc_html( $status );

		$visibility = $product->get_catalog_visibility(); // visible / catalog / search / hidden
		$visibility_text = 'visible' === $visibility ? 'public' : esc_html( $visibility );

		$in_stock = $product->is_in_stock();
		$stock_text = $in_stock ? '<b>in stock</b>' : '<b class="oos">out of stock</b>';

		return sprintf(
			'<section class="mh-pdp__panel"><h3>Publish</h3>' .
			'<div class="mh-status-row"><span>status</span><span class="v %s">&bull; %s</span></div>' .
			'<div class="mh-status-row"><span>visibility</span><span class="v">%s</span></div>' .
			'<div class="mh-status-row"><span>stock</span><span class="v">%s</span></div>' .
			'</section>',
			esc_attr( $status_dot ),
			$status_text,
			$visibility_text,
			$stock_text
		);
	}
);

/**
 * `[mh_pdp_codeblock]` — the dark `[mercantile id="…"]` shortcode strip.
 *
 * Editorial-zine bit that sits below the gallery on every PDP. Replaces
 * the old hard-coded `[mercantile id="slug" size="M"] copy →` row with
 * the *real* product slug. The "copy →" link is the easter egg target —
 * see `assets/js/copy-easter-egg.js` for the snark cycle.
 *
 * Variable products get a `size="M"` placeholder so the codeblock has
 * the same visual rhythm whether the product is simple or variable;
 * the snark fires regardless of what's in the brackets.
 */
add_shortcode(
	'mh_pdp_codeblock',
	function () {
		global $product;
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return '';
		}
		$slug = $product->get_slug();
		$size_attr = $product->is_type( 'variable' )
			? ' <span class="k">size</span>=<span class="v">"M"</span>'
			: '';
		return sprintf(
			'<div class="mh-shortcode"><span class="mh-shortcode__code">[<span class="k">mercantile</span> <span class="k">id</span>=<span class="v">"%s"</span>%s]</span><span class="copy" role="button" tabindex="0">copy shortcode &#x27F6;</span></div>',
			esc_html( $slug ),
			$size_attr
		);
	}
);

