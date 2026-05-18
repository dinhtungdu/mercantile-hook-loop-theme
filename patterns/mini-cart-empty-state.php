<?php
/**
 * Title: Mini-cart empty state
 * Slug: mercantile-hook-loop/mini-cart-empty-state
 * Inserter: no
 */

$button_attrs = wp_json_encode(
	array(
		'startShoppingButtonLabel' => __( 'keep shopping', 'mercantile-hook-loop' ),
	),
	JSON_UNESCAPED_UNICODE
);
?>
<!-- wp:paragraph {"align":"center","className":"mh-mini-cart-empty__frak"} -->
<p class="has-text-align-center mh-mini-cart-empty__frak"><?php echo esc_html__( 'Empty.', 'mercantile-hook-loop' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center"><?php echo esc_html__( 'Nothing here yet — the catalog is waiting.', 'mercantile-hook-loop' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:woocommerce/mini-cart-shopping-button-block <?php echo $button_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> -->
<div class="wp-block-woocommerce-mini-cart-shopping-button-block"></div>
<!-- /wp:woocommerce/mini-cart-shopping-button-block -->
