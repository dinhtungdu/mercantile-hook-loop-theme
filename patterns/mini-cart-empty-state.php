<?php
/**
 * Title: Mini-cart empty state
 * Slug: mercantile-hook-loop/mini-cart-empty-state
 * Inserter: no
 */

$button_attrs = wp_json_encode(
	array(
		'backgroundColor'           => 'ink',
		'startShoppingButtonLabel' => __( 'keep shopping', 'mercantile-hook-loop' ),
		'textColor'                 => 'paper',
	),
	JSON_UNESCAPED_UNICODE
);
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"60px","right":"24px","bottom":"60px","left":"24px"},"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"center","verticalAlignment":"center"}} -->
<div class="wp-block-group" style="padding-top:60px;padding-right:24px;padding-bottom:60px;padding-left:24px">
	<!-- wp:paragraph {"align":"center","textColor":"slate-2","style":{"typography":{"fontSize":"64px","lineHeight":"1"},"spacing":{"margin":{"bottom":"16px"}}},"fontFamily":"unifraktur"} -->
	<p class="has-text-align-center has-slate-2-color has-text-color has-unifraktur-font-family" style="margin-bottom:16px;font-size:64px;line-height:1"><?php echo esc_html__( 'Empty.', 'mercantile-hook-loop' ); ?></p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"align":"center","textColor":"slate","style":{"typography":{"fontSize":"16px","fontStyle":"italic"},"spacing":{"margin":{"top":"0","bottom":"18px"}}},"fontFamily":"newsreader"} -->
	<p class="has-text-align-center has-slate-color has-text-color has-newsreader-font-family" style="margin-top:0;margin-bottom:18px;font-size:16px;font-style:italic"><?php echo esc_html__( 'Nothing here yet — the catalog is waiting.', 'mercantile-hook-loop' ); ?></p>
	<!-- /wp:paragraph -->

	<!-- wp:woocommerce/mini-cart-shopping-button-block <?php echo $button_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> -->
	<div class="wp-block-woocommerce-mini-cart-shopping-button-block has-paper-color has-ink-background-color has-text-color has-background"></div>
	<!-- /wp:woocommerce/mini-cart-shopping-button-block -->
</div>
<!-- /wp:group -->
