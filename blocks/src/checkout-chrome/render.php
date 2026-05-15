<?php
/**
 * Server render for `mercantile/checkout-chrome`.
 *
 * Renders the breadcrumb + meta bar + 01/02/03 step nav that sits above
 * the WooCommerce Checkout block in the prototype. The meta bar's item
 * count is server-seeded from WC()->cart into the
 * `mercantile/checkout-meta` Interactivity store and read by the
 * `data-wp-text="state.cartCount"` directive on the rendered span — the
 * count is fixed during the checkout flow itself, so a JS view module
 * isn't needed.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$current_step  = isset( $attributes['currentStep'] ) ? (string) $attributes['currentStep'] : 'details';
$est_ship_text = isset( $attributes['estShipText'] ) && '' !== $attributes['estShipText']
	? (string) $attributes['estShipText']
	: __( '1–2 business days', 'mercantile-hook-loop' );

$cart_count = 0;
if ( function_exists( 'WC' ) && WC() && WC()->cart ) {
	$cart_count = (int) WC()->cart->get_cart_contents_count();
}

$item_label_singular = __( 'item', 'mercantile-hook-loop' );
$item_label_plural   = __( 'items', 'mercantile-hook-loop' );
$item_label          = 1 === $cart_count ? $item_label_singular : $item_label_plural;

wp_interactivity_state(
	'mercantile/checkout-meta',
	array(
		'cartCount' => $cart_count,
		'itemLabel' => $item_label,
	)
);

$steps = array(
	array( 'id' => 'cart',    'n' => '01', 'label' => __( 'cart', 'mercantile-hook-loop' ) ),
	array( 'id' => 'details', 'n' => '02', 'label' => __( 'details', 'mercantile-hook-loop' ) ),
	array( 'id' => 'confirm', 'n' => '03', 'label' => __( 'confirm', 'mercantile-hook-loop' ) ),
);

$current_idx = 1;
foreach ( $steps as $i => $s ) {
	if ( $s['id'] === $current_step ) {
		$current_idx = $i;
		break;
	}
}

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'data-wp-interactive' => 'mercantile/checkout-meta',
	)
);

?>
<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes escapes. ?>>
	<div class="ckhead">
		<div class="crumb"><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html__( '← shop', 'mercantile-hook-loop' ); ?></a><b>/</b><?php echo esc_html__( 'checkout', 'mercantile-hook-loop' ); ?></div>
		<div class="meta">
			<span><?php echo esc_html__( 'SSL', 'mercantile-hook-loop' ); ?> · <b><?php echo esc_html__( 'secure', 'mercantile-hook-loop' ); ?></b></span>
			<span><b data-wp-text="state.cartCount"><?php echo esc_html( (string) $cart_count ); ?></b> <span data-wp-text="state.itemLabel"><?php echo esc_html( $item_label ); ?></span></span>
			<span><?php echo esc_html__( 'est. ship', 'mercantile-hook-loop' ); ?> · <b><?php echo esc_html( $est_ship_text ); ?></b></span>
		</div>
	</div>
	<div class="step-nav">
		<?php foreach ( $steps as $i => $s ) :
			$state_class = '';
			if ( $i < $current_idx ) {
				$state_class = ' done';
			} elseif ( $i === $current_idx ) {
				$state_class = ' now';
			}
			?>
			<div class="step<?php echo esc_attr( $state_class ); ?>"><span class="n"><?php echo esc_html( $s['n'] ); ?></span><span><?php echo esc_html( $s['label'] ); ?></span></div>
		<?php endforeach; ?>
	</div>
</div>
