<?php
/**
 * Server render for `mercantile/mini-cart-subtotal`.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'data-wp-text' => 'woocommerce/mini-cart::state.formattedSubtotal',
	)
);
?>
<p <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>></p>
