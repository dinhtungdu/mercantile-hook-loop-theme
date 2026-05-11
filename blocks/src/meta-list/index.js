import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	Button,
	ButtonGroup,
} from '@wordpress/components';
import metadata from './block.json';
import './style.css';

const ItemEditor = ( { item, index, total, update, remove, move } ) => (
	<div
		style={ {
			borderBottom: '1px solid #e0e0e0',
			paddingBottom: 12,
			marginBottom: 12,
		} }
	>
		<TextControl
			label={ __( 'Label', 'mercantile-hook-loop' ) + ` #${ index + 1 }` }
			value={ item.label || '' }
			onChange={ ( label ) => update( index, { label } ) }
		/>
		<TextControl
			label={ __( 'Value', 'mercantile-hook-loop' ) }
			value={ item.value || '' }
			onChange={ ( value ) => update( index, { value } ) }
		/>
		<div
			style={ {
				display: 'flex',
				justifyContent: 'space-between',
				marginTop: 6,
			} }
		>
			<ButtonGroup>
				<Button
					size="small"
					variant="secondary"
					onClick={ () => move( index, -1 ) }
					disabled={ index === 0 }
					accessibleWhenDisabled
				>
					↑
				</Button>
				<Button
					size="small"
					variant="secondary"
					onClick={ () => move( index, 1 ) }
					disabled={ index === total - 1 }
					accessibleWhenDisabled
				>
					↓
				</Button>
			</ButtonGroup>
			<Button
				size="small"
				variant="secondary"
				isDestructive
				onClick={ () => remove( index ) }
			>
				{ __( 'Remove', 'mercantile-hook-loop' ) }
			</Button>
		</div>
	</div>
);

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const items = Array.isArray( attributes.items ) ? attributes.items : [];

		const update = ( i, partial ) =>
			setAttributes( {
				items: items.map( ( it, idx ) =>
					idx === i ? { ...it, ...partial } : it
				),
			} );

		const remove = ( i ) =>
			setAttributes( {
				items: items.filter( ( _, idx ) => idx !== i ),
			} );

		const add = () =>
			setAttributes( {
				items: [ ...items, { label: '', value: '' } ],
			} );

		const move = ( i, dir ) => {
			const j = i + dir;
			if ( j < 0 || j >= items.length ) {
				return;
			}
			const next = items.slice();
			[ next[ i ], next[ j ] ] = [ next[ j ], next[ i ] ];
			setAttributes( { items: next } );
		};

		const blockProps = useBlockProps( { className: 'mh-meta-list' } );

		return (
			<>
				<InspectorControls>
					<PanelBody
						title={ __( 'Meta items', 'mercantile-hook-loop' ) }
					>
						{ items.map( ( item, i ) => (
							<ItemEditor
								key={ i }
								item={ item }
								index={ i }
								total={ items.length }
								update={ update }
								remove={ remove }
								move={ move }
							/>
						) ) }
						<Button variant="primary" onClick={ add }>
							{ __( 'Add item', 'mercantile-hook-loop' ) }
						</Button>
					</PanelBody>
				</InspectorControls>
				<div { ...blockProps }>
					{ items.map( ( item, i ) => (
						<div key={ i } className="mh-meta-row">
							<span>{ item.label || '' }</span>
							<b>{ item.value || '' }</b>
						</div>
					) ) }
				</div>
			</>
		);
	},
	save: () => null,
} );
