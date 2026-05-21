import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

/**
 * Static editor preview. The real permalink and last-modified time are
 * server-rendered from the current product in render.php; the Site
 * Editor has no product context, so edit() shows the shape with
 * placeholder copy.
 */
registerBlockType( metadata.name, {
	edit: function Edit() {
		const blockProps = useBlockProps( { className: 'mh-pdp__permalink' } );

		return (
			<div { ...blockProps }>
				permalink: <span className="k">{ '/product/' }</span>
				<b className="hl-blue">
					{ __( 'product-slug', 'mercantile-hook-loop' ) }
				</b>
				<span className="mh-pdp__permalink-meta">
					&middot;{ ' ' }
					{ __( 'modified just now', 'mercantile-hook-loop' ) }
				</span>
			</div>
		);
	},
	save: () => null,
} );
