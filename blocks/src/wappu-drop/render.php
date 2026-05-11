<?php
/**
 * Server render for `mercantile/wappu-drop`.
 *
 * Emits a `+ New` tab for the ticker bar. The Interactivity API store
 * (view.js) handles the click: it spawns N `.mh-wapuu-poof` elements
 * positioned at the button, each with randomized drift/rotation
 * vectors, and removes them once the CSS animation finishes.
 *
 * The wapuu SVG asset path is passed through via wp_interactivity_state
 * so the JS doesn't have to know the theme directory URL.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$label  = isset( $attributes['label'] ) ? (string) $attributes['label'] : 'New';
$prefix = isset( $attributes['prefix'] ) ? (string) $attributes['prefix'] : '+';
$count  = isset( $attributes['count'] ) ? max( 1, min( 24, (int) $attributes['count'] ) ) : 1;

wp_interactivity_state(
	'mercantile/wappu-drop',
	array(
		'src'   => get_theme_file_uri( 'assets/images/wapuu.svg' ),
		'count' => $count,
	)
);

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class'               => 'mh-ticker__tab is-new',
		'data-wp-interactive' => 'mercantile/wappu-drop',
	)
);

printf(
	'<button type="button" %1$s data-wp-on--click="actions.drop" aria-label="%2$s"><span class="mh-ticker__tab-plus" aria-hidden="true">%3$s</span><span>%4$s</span></button>',
	$wrapper_attrs,
	esc_attr( $label ),
	esc_html( $prefix ),
	esc_html( $label )
);
