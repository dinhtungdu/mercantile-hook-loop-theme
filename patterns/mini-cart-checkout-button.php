<?php
/**
 * Title: Mini Cart Checkout Button
 * Slug: mercantile-2026/mini-cart-checkout-button
 * Inserter: no
 */

$checkout_url = function_exists( 'wc_get_checkout_url' )
	? wc_get_checkout_url()
	: home_url( '/checkout/' );
?>
<!-- wp:buttons {"style":{"spacing":{"blockGap":"0","margin":{"top":"16px","bottom":"0"}}},"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons" style="margin-top:16px;margin-bottom:0">
	<!-- wp:button {"width":100,"backgroundColor":"wp","textColor":"card","style":{"border":{"radius":"0px"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}},"typography":{"fontSize":"12px","fontWeight":"600","letterSpacing":"0.08em","textTransform":"uppercase"}}} -->
	<div class="wp-block-button has-custom-width wp-block-button__width-100">
		<a
			class="wp-block-button__link has-card-color has-wp-background-color has-text-color has-background has-custom-font-size wp-element-button"
			href="<?php echo esc_url( $checkout_url ); ?>"
			style="border-radius:0px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase"
		><?php esc_html_e( 'PROCEED TO CHECKOUT →', 'mercantile-2026' ); ?></a>
	</div>
	<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
