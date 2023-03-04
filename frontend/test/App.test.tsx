import {describe, it, expect} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {Title} from "../src/components/Home";
import {TestExampleButton} from "../src/components/TestExampleButton";




describe('Components tests', () => {
  it('should show Doggr in title component', () => {
    render(<Title />);

		expect(screen.getByText("Doggr"))
			.toBeDefined();
  });

	it('test example button', async () => {
		render(<TestExampleButton />);
		const btn = screen.getByRole('button');

		expect(btn).not.toBeDisabled();
		expect(btn).toHaveTextContent("Clicks: 0");

		await act( async() => {
			return userEvent.click(btn);
		});

		expect(btn).toHaveTextContent("Clicks: 1");
	});
});
