import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

/**
 * Static editor preview. The real trail (category, title, permalinks)
 * is server-rendered from the current product in render.php; the Site
 * Editor has no product context, so edit() shows the shape with
 * placeholder copy rather than an empty ServerSideRender frame. The
 * crumb segments are non-navigable spans here — the live <a>s belong
 * to the server render.
 */
registerBlockType( metadata.name, {
	edit: function Edit() {
		const blockProps = useBlockProps( { className: 'mh-pdp__header' } );

		return (
			<header { ...blockProps }>
				<div className="mh-pdp__crumb">
					<span>mercantile</span>
					<span className="sl">/</span>
					<span>{ __( 'category', 'mercantile-hook-loop' ) }</span>
					<span className="sl">/</span>
					<b>{ __( 'product title', 'mercantile-hook-loop' ) }</b>
				</div>
				<button
					className="mh-pdp__close"
					type="button"
					aria-label={ __( 'Go back', 'mercantile-hook-loop' ) }
				>
					&times;
				</button>
			</header>
		);
	},
	save: () => null,
} );
