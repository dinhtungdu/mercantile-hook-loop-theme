<?php
/**
 * Server render for `mercantile/pdp-permalink`.
 *
 * The editor-style permalink row that sits above the product title:
 * `permalink: <site>/product/<slug> · modified <date>`. The URL is
 * split at the slug so the slug can be highlighted (matching the
 * prototype's editor-style URL row), and the real last-modified time
 * is rendered as a human-readable diff ("3 days ago").
 *
 * Renders nothing off-product so accidental placement degrades quietly.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $product;
if ( ! is_a( $product, 'WC_Product' ) ) {
	return;
}

$permalink = get_permalink( $product->get_id() );
$slug      = basename( untrailingslashit( $permalink ) );
// Everything up to (and including) /product/ — strip the slug off the end.
$prefix = substr( $permalink, 0, strrpos( untrailingslashit( $permalink ), '/' ) + 1 );

$modified = get_post_modified_time( 'U', true, $product->get_id() );
$diff     = human_time_diff( $modified, current_time( 'timestamp', true ) );

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'mh-pdp__permalink' ) );

printf(
	'<div %1$s>permalink: <span class="k">%2$s</span><b class="hl-blue">%3$s</b><span class="mh-pdp__permalink-meta">&middot; modified %4$s ago</span></div>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is pre-escaped.
	esc_html( $prefix ),
	esc_html( $slug ),
	esc_html( $diff )
);
