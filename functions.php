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
 * related-products row) opens the product in a `<dialog>` instead of a
 * full-page navigation.
 *
 * Loading labels flow through `wp_interactivity_config()` rather than the JS
 * `__()` runtime (CLAUDE.md note 19/20: static values use config, reactive
 * values use state). The JS picks one at random per open via `getConfig()`.
 *
 * Direct loads of /product/<slug> render the standalone product page. The
 * same module runs there too: its close button posts a message to the
 * parent when embedded in the modal's <iframe>, or navigates home on a
 * direct visit.
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
			array( '@wordpress/interactivity' ),
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
 * Inject the PDP `<dialog>` scaffold on catalog-type pages (anything that
 * is not itself a single product). Clicking a product link calls
 * actions.open(), which `showModal()`s this dialog and points the
 * `<iframe>` at the product URL — a real page load, fully hydrated, with
 * every WooCommerce asset, in an isolated browsing context.
 *
 * The native `<dialog>` earns its keep: top-layer rendering (no z-index
 * fights), a `::backdrop` pseudo-element that dims the *real* catalog
 * still mounted underneath (no fake scrim, no screenshot), focus
 * trapping, and Escape-to-close — all from the platform.
 *
 * Skipped on `is_product()` because the product page IS the thing the
 * iframe loads; it must never nest its own dialog. The wapuu overlay
 * shows while the iframe's `load` event is pending.
 */
add_action(
	'wp_footer',
	function () {
		if ( is_admin() || ( function_exists( 'is_product' ) && is_product() ) ) {
			return;
		}
		?>
		<dialog
			class="mh-pdp-dialog"
			data-wp-interactive="mercantile/pdp-modal"
			data-wp-class--is-loading="state.isLoading"
		>
			<iframe
				class="mh-pdp-dialog__frame"
				title="<?php esc_attr_e( 'Product details', 'mercantile-hook-loop' ); ?>"
			></iframe>
			<div class="mh-pdp-dialog__loading" aria-hidden="true">
				<pre class="mh-wapuu-ascii"></pre>
				<span class="mh-pdp-dialog__loading-line" data-wp-text="state.loadingText"></span>
			</div>
		</dialog>
		<?php
	}
);

/**
 * Tag the document body with `mh-pdp-embed` when the product page is
 * being requested inside the modal's `<iframe>` (the iframe src carries
 * `?mh-embed=1`). The class lets the stylesheet drop `.mh-pdp-wrap`'s
 * own background so the dialog's translucent `::backdrop` — and the real
 * catalog behind it — shows through, instead of an opaque grey panel.
 */
add_filter(
	'body_class',
	function ( $classes ) {
		if ( isset( $_GET['mh-embed'] ) ) {
			$classes[] = 'mh-pdp-embed';
		}
		return $classes;
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
// the editor iframe — where the canvas actually renders — so font + style
// rules reach the document that needs them. Guarded with `is_admin()`
// because the same hook also fires on the front-end, where
// `wp_enqueue_scripts` already loads the same assets. `add_editor_style()`
// is the documented hook for theme CSS in the editor, but it doesn't
// reliably propagate to the site-editor canvas iframe — so we re-enqueue
// here for parity with the front-end.
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
		wp_enqueue_style(
			'mercantile-hook-loop-style-editor',
			get_stylesheet_uri(),
			array( 'mercantile-hook-loop-fonts-editor' ),
			wp_get_theme()->get( 'Version' )
		);
	}
);

/*
 * PDP chrome — breadcrumb, permalink, publish-meta, and the dark
 * [mercantile id="…"] codeblock — used to be prototype-chrome shortcodes
 * here. They are now theme blocks under blocks/src/pdp-*, registered by
 * the glob above; per-product specs use the core
 * woocommerce/product-specifications block. The single-product template
 * places them directly. See CLAUDE.md for the supports-first rationale.
 */

