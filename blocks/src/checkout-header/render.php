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
$cart_url = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );
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
		<a class="step done" href="<?php echo esc_url( $cart_url ); ?>"><span class="n">01</span><span><?php echo esc_html__( 'cart', 'mercantile-hook-loop' ); ?></span></a>
		<div class="step now"><span class="n">02</span><span><?php echo esc_html__( 'details', 'mercantile-hook-loop' ); ?></span></div>
		<div class="step"><span class="n">03</span><span><?php echo esc_html__( 'confirm', 'mercantile-hook-loop' ); ?></span></div>
	</div>
</section>
