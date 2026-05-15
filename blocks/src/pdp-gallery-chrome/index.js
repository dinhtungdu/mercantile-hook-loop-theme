/**
 * Editor registration for `mercantile/pdp-gallery-chrome`.
 *
 * The block is dynamic and lives inside `wp:woocommerce/product-gallery`
 * (enforced by block.json `ancestor`). The Site Editor template view
 * has no specific product, so render.php emits a representative
 * preview ("fig. 42 · apparel", "see more · 1/3") when no postId is
 * available — we use `ServerSideRender` here so the editor canvas
 * shows exactly what the front end will, including the chrome
 * supports (paper-2 strip, bottom rule, padding) styled by attribute
 * defaults rather than re-implementing it in JSX.
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import metadata from './block.json';
import './style.css';

function Edit() {
	const blockProps = useBlockProps();
	return (
		<div { ...blockProps }>
			<ServerSideRender
				block={ metadata.name }
				EmptyResponsePlaceholder={ () => (
					<div className="mh-gallery-chrome">
						<span className="mh-gallery-chrome__fig">
							{ __(
								'fig. 00 · category',
								'mercantile-hook-loop'
							) }
						</span>
						<button
							type="button"
							className="mh-gallery-chrome__pill"
							disabled
						>
							{ __( 'see more · 1/N', 'mercantile-hook-loop' ) }
						</button>
					</div>
				) }
			/>
		</div>
	);
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
} );
