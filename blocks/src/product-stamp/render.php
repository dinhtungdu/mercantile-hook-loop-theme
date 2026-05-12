<?php
/**
 * Server render for `mercantile/product-stamp`.
 *
 * Decorative stock-status stamp pinned to the bottom-right of a
 * product image inside `mh-cell`. The variant icon and label cycle
 * per cell index via :nth-child rules on the surrounding
 * wc-block-product-template — the block itself just emits the static
 * markup.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$text = ! empty( $attributes['text'] )
	? (string) $attributes['text']
	: __( 'in stock', 'mercantile-hook-loop' );

$wrapper_attrs = get_block_wrapper_attributes( array( 'class' => 'mh-cell__stamp-row' ) );

printf(
	'<div %1$s><span class="mh-cell__stamp">%2$s</span></div>',
	$wrapper_attrs,
	esc_html( $text )
);
