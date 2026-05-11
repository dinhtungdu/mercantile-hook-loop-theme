<?php
/**
 * Server render for `mercantile/meta-list`.
 *
 * Each item is a uniform { label, value } record stored on the block's
 * `items` attribute. We emit one .mh-meta-row per item with a small
 * inline format whitelist on each side so authors can mark up emphasis
 * without opening the door to arbitrary HTML.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$items = isset( $attributes['items'] ) && is_array( $attributes['items'] ) ? $attributes['items'] : array();
if ( ! $items ) {
	return;
}

$allowed_html = array(
	'strong' => array(),
	'b'      => array(),
	'em'     => array(),
	'i'      => array(),
	'span'   => array( 'class' => array() ),
);

$inner_html = '';
foreach ( $items as $item ) {
	if ( ! is_array( $item ) ) {
		continue;
	}
	$label = isset( $item['label'] ) ? wp_kses( (string) $item['label'], $allowed_html ) : '';
	$value = isset( $item['value'] ) ? wp_kses( (string) $item['value'], $allowed_html ) : '';
	if ( '' === trim( wp_strip_all_tags( $label ) ) && '' === trim( wp_strip_all_tags( $value ) ) ) {
		continue;
	}
	$inner_html .= sprintf( '<div class="mh-meta-row"><span>%s</span><b>%s</b></div>', $label, $value );
}

if ( '' === $inner_html ) {
	return;
}

$wrapper_attrs = get_block_wrapper_attributes( array( 'class' => 'mh-meta-list' ) );

printf( '<div %1$s>%2$s</div>', $wrapper_attrs, $inner_html );
