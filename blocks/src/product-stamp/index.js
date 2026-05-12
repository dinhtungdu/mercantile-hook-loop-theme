import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const blockProps = useBlockProps( { className: 'mh-cell__stamp-row' } );
		return (
			<div { ...blockProps }>
				<RichText
					tagName="span"
					className="mh-cell__stamp"
					value={ attributes.text }
					onChange={ ( text ) => setAttributes( { text } ) }
					placeholder={ __( 'in stock', 'mercantile-hook-loop' ) }
					allowedFormats={ [] }
					disableLineBreaks
				/>
			</div>
		);
	},
	save: () => null,
} );
