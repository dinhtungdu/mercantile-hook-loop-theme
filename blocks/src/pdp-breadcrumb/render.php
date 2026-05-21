<?php
/**
 * Server render for `mercantile/pdp-breadcrumb`.
 *
 * The editor-style breadcrumb header on the single-product template:
 * mercantile / <category> / <title>. "mercantile" links home, the
 * category links its archive, and the product title renders as bold
 * non-link text (we're already on it).
 *
 * The close × button carries the iAPI `mercantile/pdp-modal::actions.close`
 * directive — fully resolved through the `data-wp-interactive` namespace
 * emitted on the <header>. In the PDP modal, that action posts a close
 * message up to the parent; on a direct visit it falls back to a plain
 * navigation home. See assets/js/pdp-modal.js.
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

$cat_html = '';
$terms    = get_the_terms( $product->get_id(), 'product_cat' );
if ( $terms && ! is_wp_error( $terms ) ) {
	$primary  = reset( $terms );
	$cat_html = sprintf(
		'<a href="%s">%s</a><span class="sl">/</span>',
		esc_url( get_term_link( $primary ) ),
		esc_html( strtolower( $primary->name ) )
	);
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'               => 'mh-pdp__header',
		'data-wp-interactive' => 'mercantile/pdp-modal',
	)
);

printf(
	'<header %1$s><div class="mh-pdp__crumb"><a href="%2$s">mercantile</a><span class="sl">/</span>%3$s<b>%4$s</b></div><button class="mh-pdp__close" type="button" aria-label="%5$s" data-wp-on--click="actions.close">&times;</button></header>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is pre-escaped.
	esc_url( home_url( '/' ) ),
	$cat_html, // Pre-escaped above.
	esc_html( strtolower( $product->get_name() ) ),
	esc_attr__( 'Go back', 'mercantile-2026' )
);
