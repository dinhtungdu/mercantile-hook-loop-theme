<?php
/**
 * Title: Mini-cart checkout action
 * Slug: mercantile-hook-loop/mini-cart-checkout-action
 * Inserter: no
 */

$checkout_attrs = wp_json_encode(
	array(
		'backgroundColor'      => 'wp',
		'checkoutButtonLabel' => __( 'proceed to checkout →', 'mercantile-hook-loop' ),
		'textColor'            => 'card',
	),
	JSON_UNESCAPED_UNICODE
);
?>
<!-- wp:woocommerce/mini-cart-checkout-button-block <?php echo $checkout_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> -->
<div class="wp-block-woocommerce-mini-cart-checkout-button-block has-card-color has-wp-background-color has-text-color has-background"></div>
<!-- /wp:woocommerce/mini-cart-checkout-button-block -->
