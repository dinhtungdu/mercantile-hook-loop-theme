import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import metadata from './block.json';
import './style.css';

registerBlockType( metadata.name, {
	edit: function Edit( { attributes, setAttributes } ) {
		const { categories } = attributes;
		const blockProps = useBlockProps();

		return (
			<>
				<InspectorControls>
					<PanelBody
						title={ __( 'Section Filters', 'mercantile-2026' ) }
					>
						<TextControl
							label={ __(
								'Category slugs (comma separated)',
								'mercantile-2026'
							) }
							help={ __(
								'Product category slugs rendered as chips, in display order.',
								'mercantile-2026'
							) }
							value={ categories || '' }
							onChange={ ( v ) =>
								setAttributes( { categories: v } )
							}
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...blockProps }>
					<ServerSideRender
						block={ metadata.name }
						attributes={ attributes }
					/>
				</div>
			</>
		);
	},
	save: () => null,
} );
