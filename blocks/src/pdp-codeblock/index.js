import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

/**
 * Static editor preview. The real product slug is server-rendered in
 * render.php; the Site Editor has no product context, so edit() shows
 * the strip with a placeholder slug. The "copy shortcode" easter egg
 * (view.js) is front-end only — inert in the editor.
 */
registerBlockType( metadata.name, {
	edit: function Edit() {
		const blockProps = useBlockProps( { className: 'mh-shortcode' } );

		return (
			<div { ...blockProps }>
				<span className="mh-shortcode__code">
					[<span className="k">mercantile</span>{ ' ' }
					<span className="k">id</span>=
					<span className="v">&quot;product-slug&quot;</span>]
				</span>
				<span className="copy">copy shortcode &#x27F6;</span>
			</div>
		);
	},
	save: () => null,
} );
