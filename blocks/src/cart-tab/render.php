<?php
/**
 * Server render for `mercantile/cart-tab`.
 *
 * Emits the ticker's cart link with an Interactivity API binding
 * (`data-wp-text="state.itemCount"`) so the count stays current as the
 * shopper adds or removes items elsewhere on the page. The state is
 * derived in view.js from WooCommerce's locked `woocommerce` iAPI
 * cart store; we seed that store server-side via load_cart_state() so
 * the count is correct on first paint, before any client-side fetch.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'WC' ) ) {
	return;
}

$cart_url = ! empty( $attributes['cartUrl'] ) ? esc_url( $attributes['cartUrl'] ) : esc_url( wc_get_cart_url() );
$label    = isset( $attributes['label'] ) ? (string) $attributes['label'] : 'cart';

// Pre-populate the WC cart state in the iAPI store so the initial
// hydrated value of state.itemCount matches the server-rendered count.
// load_cart_state() requires the consent acknowledgment string so WC
// knows we're aware we're touching a private/locked store.
if ( class_exists( 'Automattic\\WooCommerce\\Blocks\\Utils\\BlocksSharedState' ) ) {
	$consent = 'I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WooCommerce';
	\Automattic\WooCommerce\Blocks\Utils\BlocksSharedState::load_cart_state( $consent );
}

$initial_count = isset( WC()->cart ) ? (int) WC()->cart->get_cart_contents_count() : 0;

// Translatable singular/plural words for the "N items" label rendered
// by the mini-cart drawer header (data-wp-text="state.itemsLabel"). Per
// CLAUDE.md note 19/20, view.js never calls __(); strings are seeded
// here and read via getConfig().
wp_interactivity_config(
	'mercantile/cart-tab',
	array(
		'itemSingular' => __( 'item', 'mercantile-hook-loop' ),
		'itemPlural'   => __( 'items', 'mercantile-hook-loop' ),
	)
);

// Seed our own state so the SSR pass for data-wp-text="state.itemCount"
// (and state.itemsLabel) resolves to the same number/label that the
// client-side getters compute once view.js hydrates. itemCount is a
// string so a 0 count still renders as "0" rather than being coerced to
// an empty value by the directive processor.
$items_word = 1 === $initial_count
	? __( 'item', 'mercantile-hook-loop' )
	: __( 'items', 'mercantile-hook-loop' );
wp_interactivity_state(
	'mercantile/cart-tab',
	array(
		'itemCount'  => (string) $initial_count,
		'itemsLabel' => sprintf( '%d %s', $initial_count, $items_word ),
	)
);

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class'                                            => 'mh-ticker__tab',
		'data-wp-interactive'                              => 'mercantile/cart-tab',
	)
);

printf(
	'<p %1$s><a href="%2$s" data-wp-on--click="actions.openCart">%3$s <strong data-wp-text="state.itemCount">%4$d</strong></a></p>',
	$wrapper_attrs,
	$cart_url,
	esc_html( $label ),
	$initial_count
);
