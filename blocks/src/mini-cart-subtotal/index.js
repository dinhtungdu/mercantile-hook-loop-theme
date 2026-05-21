import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';

function Edit() {
	const blockProps = useBlockProps();

	return <p { ...blockProps }>{ __( '$28.00', 'mercantile-2026' ) }</p>;
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
} );
