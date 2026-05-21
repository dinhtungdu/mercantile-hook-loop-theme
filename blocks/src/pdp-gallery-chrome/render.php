<?php
/**
 * Server render for `mercantile/pdp-gallery-chrome`.
 *
 * Emits the toolbar strip that sits above the WooCommerce product
 * gallery viewer:
 *
 * - Left badge: "fig. NN · CATEGORY" where NN is a deterministic
 *   per-product hash (so the same product always reads the same
 *   figure number — it's catalog flavour, not data) and CATEGORY is
 *   the first product taxonomy term.
 * - Right pill: "see more · 1/N" image counter. Bound to our own
 *   `actions.next` (registered in view.js) which computes a wrapped
 *   next index, then delegates to WooCommerce product-gallery's private
 *   `selectImage` action. This wraps back to the first image after the
 *   last, which WC's own `selectNextImage` does not.
 *
 * The block must live inside `wp:woocommerce/product-gallery` (enforced
 * by block.json `ancestor`) so the WC gallery's `data-wp-context` is
 * in scope for our getter and for our scroll lookup.
 *
 * Chrome (paper-2 background, dashed bottom rule, padding) is expressed
 * via block supports + attribute defaults in block.json — render here
 * only adds the iAPI directives and the inner badge/pill.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $post;
$post_id = ( $post instanceof WP_Post ) ? (int) $post->ID : 0;

// Editor / SSR preview: when there's no post context (e.g. Site Editor
// template view), use representative placeholder copy so the strip
// still looks like a real product card instead of "fig. 00 · category".
$is_preview = 0 === $post_id;

if ( $is_preview ) {
	$fig_num    = '42';
	$category   = __( 'apparel', 'mercantile-2026' );
	$total      = 3;
	$start_idx  = 1;
} else {
	// Deterministic two-digit figure number. crc32 keeps the value
	// stable across renders so the same product always shows the same
	// fig. NN.
	$fig_num = sprintf( '%02d', abs( crc32( (string) $post_id ) ) % 100 );

	$category = '';
	$terms    = get_the_terms( $post_id, 'product_cat' );
	if ( is_array( $terms ) && ! empty( $terms ) ) {
		$category = $terms[0]->name;
	}

	// Initial image count for the SSR'd counter — mirrors how WC counts
	// gallery images: the main product image plus the gallery image IDs.
	$total = 1;
	if ( function_exists( 'wc_get_product' ) ) {
		$product = wc_get_product( $post_id );
		if ( $product instanceof WC_Product ) {
			$gallery_ids = $product->get_gallery_image_ids();
			$total       = max( 1, 1 + count( $gallery_ids ) );
		}
	}
	$start_idx = 1;
}

$fig_label = $category
	? sprintf( '%s %s · %s', __( 'fig.', 'mercantile-2026' ), $fig_num, $category )
	: sprintf( '%s %s', __( 'fig.', 'mercantile-2026' ), $fig_num );

$counter = sprintf(
	/* translators: 1: current image index, 2: total image count. */
	__( 'see more · %1$d/%2$d', 'mercantile-2026' ),
	$start_idx,
	$total
);

// Seed reactive state so the first paint (before view.js hydrates)
// resolves data-wp-text="state.counter" to the same string we render
// inline below, and the post-hydration getter takes over from there.
wp_interactivity_state(
	'mercantile/pdp-gallery-chrome',
	array(
		'counter' => $counter,
	)
);

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'               => 'mh-gallery-chrome',
		'data-wp-interactive' => 'mercantile/pdp-gallery-chrome',
	)
);

printf(
	'<div %1$s><span class="mh-gallery-chrome__fig">%2$s</span><button type="button" class="mh-gallery-chrome__pill" data-wp-on--click="actions.next" data-wp-text="state.counter">%3$s</button></div>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is pre-escaped.
	esc_html( $fig_label ),
	esc_html( $counter )
);
