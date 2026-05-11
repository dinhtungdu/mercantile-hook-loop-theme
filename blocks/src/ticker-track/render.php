<?php
/**
 * Server render for `mercantile/ticker-track`.
 *
 * Inner blocks are real `core/paragraph` items (one per ticker line)
 * authored in the editor. WP renders the inner block content into the
 * `$content` argument; we wrap it in the rail/track scaffold and emit
 * it twice in a row so the CSS marquee animation can scroll -50% for
 * a seamless loop.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$inner = trim( (string) $content );
if ( '' === $inner ) {
	return;
}

$wrapper_attrs = get_block_wrapper_attributes( array( 'class' => 'mh-ticker__rail' ) );

printf(
	'<div %1$s><div class="mh-ticker__track">%2$s%2$s</div></div>',
	$wrapper_attrs,
	$inner
);
