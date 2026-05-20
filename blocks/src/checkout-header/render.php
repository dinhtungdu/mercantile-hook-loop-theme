<?php
/**
 * Server render for `mercantile/checkout-header`.
 *
 * Static checkout chrome kept as one block so the checkout template no
 * longer carries a raw `wp:html` island.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class'      => 'checkout-head',
		'aria-label' => __( 'Checkout progress', 'mercantile-hook-loop' ),
	)
);
$current = isset( $attributes['current'] ) ? (string) $attributes['current'] : 'checkout';
if ( function_exists( 'is_order_received_page' ) && is_order_received_page() ) {
	$current = 'confirm';
} elseif ( function_exists( 'is_cart' ) && is_cart() ) {
	$current = 'cart';
} elseif ( function_exists( 'is_checkout' ) && is_checkout() ) {
	$current = 'checkout';
}

$is_cart_step     = 'cart' === $current;
$is_checkout_step = 'checkout' === $current;
$is_confirm_step  = 'confirm' === $current;
$cart_url         = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );
$checkout_url     = function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/checkout/' );
?>
<section <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="ckhead">
		<div class="crumb"><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html__( '← shop', 'mercantile-hook-loop' ); ?></a><b>/</b><?php echo esc_html__( 'checkout', 'mercantile-hook-loop' ); ?></div>
		<div class="meta">
			<span><?php echo esc_html__( 'SSL', 'mercantile-hook-loop' ); ?> · <b><?php echo esc_html__( 'secure', 'mercantile-hook-loop' ); ?></b></span>
			<span><?php echo esc_html__( 'est. ship', 'mercantile-hook-loop' ); ?> · <b><?php echo esc_html__( '1–2 business days', 'mercantile-hook-loop' ); ?></b></span>
		</div>
	</div>
	<div class="step-nav">
		<?php if ( $is_cart_step ) : ?>
			<div class="step now"><span class="n">01</span><span><?php echo esc_html__( 'cart', 'mercantile-hook-loop' ); ?></span></div>
		<?php else : ?>
			<a class="step done" href="<?php echo esc_url( $cart_url ); ?>"><span class="n">01</span><span><?php echo esc_html__( 'cart', 'mercantile-hook-loop' ); ?></span></a>
		<?php endif; ?>
		<?php if ( $is_checkout_step ) : ?>
			<div class="step now"><span class="n">02</span><span><?php echo esc_html__( 'details', 'mercantile-hook-loop' ); ?></span></div>
		<?php else : ?>
			<a class="step <?php echo $is_confirm_step ? 'done' : ''; ?>" href="<?php echo esc_url( $checkout_url ); ?>"><span class="n">02</span><span><?php echo esc_html__( 'details', 'mercantile-hook-loop' ); ?></span></a>
		<?php endif; ?>
		<div class="step <?php echo $is_confirm_step ? 'now' : ''; ?>"><span class="n">03</span><span><?php echo esc_html__( 'confirm', 'mercantile-hook-loop' ); ?></span></div>
	</div>
</section>
