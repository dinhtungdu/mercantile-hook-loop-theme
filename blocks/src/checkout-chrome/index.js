import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import metadata from './block.json';

const STEPS = [
	{ id: 'cart', n: '01', label: 'cart' },
	{ id: 'details', n: '02', label: 'details' },
	{ id: 'confirm', n: '03', label: 'confirm' },
];

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { currentStep, estShipText } = attributes;
		const blockProps = useBlockProps();
		const currentIdx = STEPS.findIndex( ( s ) => s.id === currentStep );

		return (
			<>
				<InspectorControls>
					<PanelBody
						title={ __(
							'Checkout Chrome',
							'mercantile-hook-loop'
						) }
					>
						<SelectControl
							label={ __(
								'Current step',
								'mercantile-hook-loop'
							) }
							value={ currentStep }
							options={ STEPS.map( ( s ) => ( {
								label: s.label,
								value: s.id,
							} ) ) }
							onChange={ ( v ) =>
								setAttributes( { currentStep: v } )
							}
						/>
						<TextControl
							label={ __(
								'Est. ship label',
								'mercantile-hook-loop'
							) }
							value={ estShipText }
							onChange={ ( v ) =>
								setAttributes( { estShipText: v } )
							}
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...blockProps }>
					<div className="ckhead">
						<div className="crumb">
							<a href="/">
								{ __( '← shop', 'mercantile-hook-loop' ) }
							</a>
							<b>/</b>
							{ __( 'checkout', 'mercantile-hook-loop' ) }
						</div>
						<div className="meta">
							<span>
								{ __( 'SSL', 'mercantile-hook-loop' ) } ·{ ' ' }
								<b>
									{ __(
										'secure',
										'mercantile-hook-loop'
									) }
								</b>
							</span>
							<span>
								<b>0</b>{ ' ' }
								{ __( 'items', 'mercantile-hook-loop' ) }
							</span>
							<span>
								{ __(
									'est. ship',
									'mercantile-hook-loop'
								) }{ ' ' }
								· <b>{ estShipText }</b>
							</span>
						</div>
					</div>
					<div className="step-nav">
						{ STEPS.map( ( s, i ) => {
							const stateClass =
								i < currentIdx
									? ' done'
									: i === currentIdx
									? ' now'
									: '';
							return (
								<div
									key={ s.id }
									className={ `step${ stateClass }` }
								>
									<span className="n">{ s.n }</span>
									<span>{ s.label }</span>
								</div>
							);
						} ) }
					</div>
				</div>
			</>
		);
	},
	save: () => null,
} );
