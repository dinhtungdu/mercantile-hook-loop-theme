<?php
/**
 * Server render for `mercantile/product-view-cue`.
 *
 * Decorative hover affordance positioned at the bottom-right of a
 * product cell. Marked aria-hidden because the cell-spanning title
 * link (mh-cell__title a::after { inset: 0 }) is the actual navigation
 * target — the cue is a visual hint only.
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
	: __( 'view →', 'mercantile-hook-loop' );

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class'       => 'mh-cell__view',
		'aria-hidden' => 'true',
	)
);

printf( '<span %1$s>%2$s</span>', $wrapper_attrs, esc_html( $text ) );
