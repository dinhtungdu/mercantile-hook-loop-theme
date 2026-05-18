import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, Notice } from '@wordpress/components';
import metadata from './block.json';
import './style.css';

/**
 * Static editor preview — intentionally NOT live data.
 *
 * The front-end render.php pulls real WooCommerce counts and the current
 * server time. The editor shows realistic-looking sample values so the
 * paragraph behaves like a normal `<p>` in the canvas (no ServerSideRender
 * wrapper, no extra layout boxes). The Inspector notice tells the editor
 * user that the values shown here are not the ones that will ship.
 */
function PreviewContent( { kind } ) {
	switch ( kind ) {
		case 'date':
			return 'vol. NN · YYYY-MM-DD';
		case 'time':
			return 'updated HH:MM UTC';
		case 'counts':
		default:
			return (
				<>
					<mark
						style={ { backgroundColor: 'transparent' } }
						className="has-inline-color has-ink-color"
					>
						<strong>NN</strong>
					</mark>{ ' ' }
					products ·{ ' ' }
					<mark
						style={ { backgroundColor: 'transparent' } }
						className="has-inline-color has-ink-color"
					>
						<strong>N</strong>
					</mark>{ ' ' }
					categories
				</>
			);
	}
}

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { kind, textAlign } = attributes;

		const extraClasses = [
			'mh-site-stat',
			`is-kind-${ kind }`,
			textAlign && 'left' !== textAlign
				? `has-text-align-${ textAlign }`
				: '',
		]
			.filter( Boolean )
			.join( ' ' );

		const blockProps = useBlockProps( { className: extraClasses } );

		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={ textAlign }
						onChange={ ( v ) =>
							setAttributes( { textAlign: v || 'left' } )
						}
					/>
				</BlockControls>
				<InspectorControls>
					<PanelBody
						title={ __( 'Site Stat', 'mercantile-hook-loop' ) }
					>
						<Notice status="info" isDismissible={ false }>
							{ __(
								'The editor shows a placeholder. The front-end will display live values (product/category counts, current date, or server time).',
								'mercantile-hook-loop'
							) }
						</Notice>
						<SelectControl
							label={ __( 'Kind', 'mercantile-hook-loop' ) }
							value={ kind }
							options={ [
								{
									label: __(
										'Product + category counts',
										'mercantile-hook-loop'
									),
									value: 'counts',
								},
								{
									label: __(
										'Volume + date',
										'mercantile-hook-loop'
									),
									value: 'date',
								},
								{
									label: __(
										'Updated time',
										'mercantile-hook-loop'
									),
									value: 'time',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { kind: v } )
							}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					</PanelBody>
				</InspectorControls>
				<p { ...blockProps }>
					<PreviewContent kind={ kind } />
				</p>
			</>
		);
	},
	save: () => null,
} );
