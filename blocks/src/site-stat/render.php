<?php
/**
 * Server render for `mercantile/site-stat`.
 *
 * One block, three kinds, all dynamic:
 *
 *   counts → "<strong>{n}</strong> products · <strong>{n}</strong> categories"
 *   date   → "vol. {NN} · {YYYY-MM-DD}"  (volume increments weekly from launch)
 *   time   → "updated {HH:MM} UTC"        (server time at render)
 *
 * The wrapper element is a `<p>` so the block reads as a paragraph in the
 * flow, matching the existing masthead's prose-level rhythm.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$kind       = isset( $attributes['kind'] ) ? (string) $attributes['kind'] : 'counts';
$text_align = isset( $attributes['textAlign'] ) ? (string) $attributes['textAlign'] : 'left';

// Launch date for the prototype's "vol." counter — increments weekly.
// Treat this as the masthead's vol. 01 anchor; if Tung wants to shift the
// rhythm (biweekly, monthly), change this date or the divisor below.
$vol_one_anchor = '2026-04-13';

$inner = '';

switch ( $kind ) {
	case 'counts':
		$products = (int) wp_count_posts( 'product' )->publish;
		$cats     = (int) wp_count_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => true,
			)
		);
		// Match the existing inline-color/<strong> emphasis used elsewhere
		// in the masthead so design swaps cleanly with the static markup.
		$inner = sprintf(
			'<mark style="background-color:transparent" class="has-inline-color has-ink-color"><strong>%d</strong></mark> products · <mark style="background-color:transparent" class="has-inline-color has-ink-color"><strong>%d</strong></mark> categories',
			$products,
			$cats
		);
		break;

	case 'date':
		$anchor = new DateTimeImmutable( $vol_one_anchor, new DateTimeZone( 'UTC' ) );
		$today  = new DateTimeImmutable( current_time( 'Y-m-d' ), new DateTimeZone( 'UTC' ) );
		$weeks  = (int) floor( $anchor->diff( $today )->days / 7 );
		$vol    = max( 1, $weeks + 1 );
		$inner  = sprintf( 'vol. %02d · %s', $vol, current_time( 'Y-m-d' ) );
		break;

	case 'time':
		$inner = sprintf( 'updated %s UTC', gmdate( 'H:i' ) );
		break;
}

$classes = array( 'mh-site-stat', 'is-kind-' . $kind );
if ( in_array( $text_align, array( 'center', 'right' ), true ) ) {
	$classes[] = 'has-text-align-' . $text_align;
}

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $classes ),
	)
);

// $inner is composed from controlled markup above; counts are integer-cast,
// strings are literal. Wrapper attributes come from core. Output is safe.
printf( '<p %s>%s</p>', $wrapper_attrs, $inner ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
