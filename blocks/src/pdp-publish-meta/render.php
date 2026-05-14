<?php
/**
 * Server render for `mercantile/pdp-publish-meta`.
 *
 * The wp-admin Publish meta-box mimic in the PDP sidebar: three status
 * rows (status / visibility / stock) with REAL values pulled from
 * post_status, catalog_visibility, and stock_status. The design treats
 * this as a wp-admin reference panel — the panel is intentional, only
 * the values need to tell the truth.
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

$status      = get_post_status( $product->get_id() );
$status_dot  = 'publish' === $status ? 'g' : ''; // green dot when published.
$status_text = 'publish' === $status ? 'published' : esc_html( $status );

$visibility      = $product->get_catalog_visibility(); // visible / catalog / search / hidden.
$visibility_text = 'visible' === $visibility ? 'public' : esc_html( $visibility );

$in_stock   = $product->is_in_stock();
$stock_text = $in_stock ? '<b>in stock</b>' : '<b class="oos">out of stock</b>';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'mh-pdp__panel' ) );

printf(
	'<section %1$s>' .
	'<div class="mh-status-row"><span>status</span><span class="v %2$s">&bull; %3$s</span></div>' .
	'<div class="mh-status-row"><span>visibility</span><span class="v">%4$s</span></div>' .
	'<div class="mh-status-row"><span>stock</span><span class="v">%5$s</span></div>' .
	'</section>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is pre-escaped.
	esc_attr( $status_dot ),
	$status_text,
	$visibility_text,
	$stock_text
);
