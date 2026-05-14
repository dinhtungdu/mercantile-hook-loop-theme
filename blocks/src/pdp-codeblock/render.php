<?php
/**
 * Server render for `mercantile/pdp-codeblock`.
 *
 * The dark `[mercantile id="…"]` shortcode strip that sits below the
 * PDP gallery — an editorial-zine bit rendered with the *real* product
 * slug. Variable products get a `size="M"` placeholder so the strip
 * keeps the same visual rhythm whether the product is simple or
 * variable.
 *
 * The "copy shortcode ⟶" link is a deliberate easter egg: it never
 * copies anything, it cycles snark. The behaviour lives in view.js,
 * enqueued only where this block renders.
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

$slug      = $product->get_slug();
$size_attr = $product->is_type( 'variable' )
	? ' <span class="k">size</span>=<span class="v">"M"</span>'
	: '';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'mh-shortcode' ) );

printf(
	'<div %1$s><span class="mh-shortcode__code">[<span class="k">mercantile</span> <span class="k">id</span>=<span class="v">"%2$s"</span>%3$s]</span><span class="copy" role="button" tabindex="0">copy shortcode &#x27F6;</span></div>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is pre-escaped.
	esc_html( $slug ),
	$size_attr // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup, no user input.
);
