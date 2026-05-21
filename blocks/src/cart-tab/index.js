import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import metadata from './block.json';
import './style.css';

registerBlockType( metadata.name, {
	edit: function Edit( { attributes, setAttributes } ) {
		const { cartUrl, label } = attributes;
		const blockProps = useBlockProps( { className: 'mh-ticker__tab' } );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Cart Tab', 'mercantile-2026' ) }>
						<TextControl
							label={ __(
								'Cart URL (defaults to wc_get_cart_url)',
								'mercantile-2026'
							) }
							value={ cartUrl || '' }
							onChange={ ( v ) =>
								setAttributes( { cartUrl: v } )
							}
						/>
						<TextControl
							label={ __( 'Label', 'mercantile-2026' ) }
							value={ label || '' }
							onChange={ ( v ) => setAttributes( { label: v } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<p { ...blockProps }>
					<a
						href={ cartUrl || '#' }
						onClick={ ( e ) => e.preventDefault() }
					>
						{ label || 'cart' } <strong>0</strong>
					</a>
				</p>
			</>
		);
	},
	save: () => null,
} );
