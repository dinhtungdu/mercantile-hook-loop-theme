import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

registerBlockType( metadata.name, {
	edit() {
		const blockProps = useBlockProps( {
			className: 'mh-cell__stamp is-instock',
		} );
		return (
			<span { ...blockProps }>
				{ __( 'In stock', 'mercantile-hook-loop' ) }
			</span>
		);
	},
	save: () => null,
} );
