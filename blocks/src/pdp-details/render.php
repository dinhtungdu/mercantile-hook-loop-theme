<?php
/**
 * Server render for `mercantile/pdp-details`.
 *
 * The "Details" panel body in the single-product sidebar: price,
 * category, tags, and per-product attributes — every value pulled live
 * from the current WooCommerce product. The panel heading stays a
 * core/heading block in the template; this block owns only the rows.
 *
 * Variation-driving attributes (size, colour, …) are skipped: the
 * add-to-cart variation picker already represents those, so repeating
 * them here as a comma list is redundant noise.
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

/**
 * Build one labeled spec row. $value is trusted markup — callers pass
 * either WC-generated HTML (price / term lists) or an escaped string.
 */
$render_row = static function ( $label, $value, $value_class = '' ) {
	return sprintf(
		'<div class="mh-pdp__spec-row"><span class="mh-pdp__spec-key">%1$s</span><span class="mh-pdp__spec-val %2$s">%3$s</span></div>',
		esc_html( $label ),
		esc_attr( $value_class ),
		$value
	);
};

$rows = array();

$sku = $product->get_sku();
if ( $sku ) {
	$rows[] = $render_row( __( 'SKU', 'mercantile-2026' ), esc_html( $sku ) );
}

$price_html = $product->get_price_html();
if ( $price_html ) {
	$rows[] = $render_row( __( 'price', 'mercantile-2026' ), $price_html, 'mh-pdp__spec-price' );
}

$category_list = wc_get_product_category_list( $product->get_id(), ', ' );
if ( $category_list ) {
	$rows[] = $render_row( __( 'category', 'mercantile-2026' ), $category_list, 'mh-pdp__spec-cat' );
}

$tag_list = wc_get_product_tag_list( $product->get_id(), ' ' );
if ( $tag_list ) {
	$rows[] = $render_row( __( 'tags', 'mercantile-2026' ), $tag_list, 'mh-pdp__spec-tags' );
}

foreach ( $product->get_attributes() as $attribute ) {
	if ( $attribute->get_variation() ) {
		continue; // Represented by the add-to-cart variation picker.
	}
	$value = $product->get_attribute( $attribute->get_name() );
	if ( '' === $value ) {
		continue;
	}
	$rows[] = $render_row( wc_attribute_label( $attribute->get_name() ), esc_html( $value ) );
}

if ( empty( $rows ) ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'mh-pdp__details' ) );

printf(
	'<div %1$s>%2$s</div>',
	$wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is pre-escaped.
	implode( '', $rows ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each row escapes its label/value above; WC list helpers return safe markup.
);
