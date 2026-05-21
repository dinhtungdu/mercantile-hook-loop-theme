import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

/**
 * Static editor preview. The real pills are derived per-product from
 * WooCommerce state in render.php (featured / catalog visibility /
 * stock); the Site Editor has no product context, so edit() shows the
 * full set with representative state.
 */
registerBlockType( metadata.name, {
	edit: function Edit() {
		const blockProps = useBlockProps( { className: 'mh-flags' } );

		return (
			<div { ...blockProps }>
				<span className="mh-pill is-blue">
					{ __( 'highlighted', 'mercantile-2026' ) }
				</span>
				<span className="mh-pill">
					{ __( 'indexed', 'mercantile-2026' ) }
				</span>
				<span className="mh-pill is-pink">
					{ __( 'in stock', 'mercantile-2026' ) }
				</span>
			</div>
		);
	},
	save: () => null,
} );
