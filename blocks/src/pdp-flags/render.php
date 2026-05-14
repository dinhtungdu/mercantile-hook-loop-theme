<?php
/**
 * Server render for `mercantile/pdp-flags`.
 *
 * The product-state pill row below the product blurb. Each pill is
 * derived from real WooCommerce product state, and only renders when
 * the state it reflects is actually true:
 *
 * - `highlighted` — the product is featured ( WC_Product::is_featured() ).
 * - `indexed`     — the product shows in the catalog ( catalog
 *                   visibility is `visible` or `catalog` ).
 * - `in stock` / `out of stock` — WC_Product::is_in_stock(); always
 *                   rendered, since stock status is always meaningful.
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

$pills = array();

if ( $product->is_featured() ) {
	$pills[] = array(
		'text'    => __( 'highlighted', 'mercantile-hook-loop' ),
		'variant' => 'is-blue',
	);
}

if ( in_array( $product->get_catalog_visibility(), array( 'visible', 'catalog' ), true ) ) {
	$pills[] = array(
		'text'    => __( 'indexed', 'mercantile-hook-loop' ),
		'variant' => '',
	);
}

$pills[] = $product->is_in_stock()
	? array(
		'text'    => __( 'in stock', 'mercantile-hook-loop' ),
		'variant' => 'is-pink',
	)
	: array(
		'text'    => __( 'out of stock', 'mercantile-hook-loop' ),
		'variant' => '',
	);

$inner = '';
foreach ( $pills as $pill ) {
	$class  = 'mh-pill' . ( '' !== $pill['variant'] ? ' ' . $pill['variant'] : '' );
	$inner .= sprintf(
		'<span class="%s">%s</span>',
		esc_attr( $class ),
		esc_html( $pill['text'] )
	);
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'mh-flags' ) );

printf(
	'<div %1$s>%2$s</div>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is pre-escaped.
	$inner // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each pill is escaped above.
);
