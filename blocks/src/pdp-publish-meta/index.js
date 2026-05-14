import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

/**
 * Static editor preview. The real status / visibility / stock values
 * are server-rendered from the current product in render.php; the Site
 * Editor has no product context, so edit() shows the shape with
 * representative placeholder values.
 */
registerBlockType( metadata.name, {
	edit() {
		const blockProps = useBlockProps( { className: 'mh-pdp__panel' } );

		return (
			<section { ...blockProps }>
				<h3>Publish</h3>
				<div className="mh-status-row">
					<span>status</span>
					<span className="v g">&bull; published</span>
				</div>
				<div className="mh-status-row">
					<span>visibility</span>
					<span className="v">public</span>
				</div>
				<div className="mh-status-row">
					<span>stock</span>
					<span className="v">
						<b>in stock</b>
					</span>
				</div>
			</section>
		);
	},
	save: () => null,
} );
