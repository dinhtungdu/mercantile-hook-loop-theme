<?php
/**
 * Server render for `mercantile/product-stamp`.
 *
 * Always-visible stock status badge. Reads the current product's stock
 * status from WooCommerce (`instock`, `outofstock`, `onbackorder`) and
 * renders the corresponding label, with a state-specific icon supplied
 * via CSS ::before in the block's style.css.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$post_id = isset( $block->context['postId'] ) ? (int) $block->context['postId'] : 0;
if ( ! $post_id || ! function_exists( 'wc_get_product' ) ) {
	return;
}

$product = wc_get_product( $post_id );
if ( ! $product ) {
	return;
}

$status = $product->get_stock_status();
$labels = array(
	'instock'     => __( 'In stock', 'mercantile-hook-loop' ),
	'outofstock'  => __( 'Out of stock', 'mercantile-hook-loop' ),
	'onbackorder' => __( 'On backorder', 'mercantile-hook-loop' ),
);
$label  = isset( $labels[ $status ] ) ? $labels[ $status ] : $labels['instock'];

$wrapper_attrs = get_block_wrapper_attributes(
	array( 'class' => 'mh-cell__stamp is-' . sanitize_html_class( $status ) )
);

printf( '<span %1$s>%2$s</span>', $wrapper_attrs, esc_html( $label ) );
