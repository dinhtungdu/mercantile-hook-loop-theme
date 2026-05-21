/**
 * Editor registration for `mercantile/pdp-gallery-chrome`.
 *
 * The block is dynamic (render.php on the front end); the editor preview
 * is a static JSX mirror of render.php's no-postId branch so it lines up
 * 1:1 visually. We pass the `mh-gallery-chrome` class to `useBlockProps`
 * so the chrome CSS (flex row, badge/pill, hover) and the
 * `align-self: stretch` flex-item rule both land on the same outer
 * wrapper the editor uses as the gallery's flex child.
 *
 * Chrome surfaces (paper-2 background, bottom rule, padding) come from
 * block supports + attribute defaults in block.json — they're auto-
 * applied to the wrapper by `useBlockProps` so we don't re-state them
 * here in JSX.
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

function Edit() {
	const blockProps = useBlockProps( { className: 'mh-gallery-chrome' } );
	return (
		<div { ...blockProps }>
			<span className="mh-gallery-chrome__fig">
				{ __( 'fig. 00 · category', 'mercantile-2026' ) }
			</span>
			<button type="button" className="mh-gallery-chrome__pill" disabled>
				{ __( 'see more · 1/N', 'mercantile-2026' ) }
			</button>
		</div>
	);
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
} );
