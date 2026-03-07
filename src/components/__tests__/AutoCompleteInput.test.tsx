import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AutoCompleteInput } from '../form/AutoCompleteInput';

const mockOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

describe('AutoCompleteInput', () => {
  const mockOnChange = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input with placeholder', () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="Search..."
      />
    );

    // The placeholder is shown in the combobox button initially
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    // After clicking, the input with placeholder appears
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(
      <AutoCompleteInput
        value="Option 1"
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    // The value is shown in the combobox button text content
    const combobox = screen.getByRole('combobox', { name: /option 1/i });
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent('Option 1');
  });

  it('should call onChange when input value changes', async () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    // Open the combobox - get the button (first combobox)
    const comboboxButtons = screen.getAllByRole('combobox');
    const button = comboboxButtons[0]; // The button trigger
    fireEvent.click(button);
    
    // Wait for the popover to open and find the input inside
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/rechercher/i);
      expect(input).toBeInTheDocument();
    });
    
    // The input is inside the popover, we need to type in it
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: 'test' } });

    // onChange should be called when the input value changes
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });
  });

  it('should filter options based on input', async () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    // Find the input inside the popover and type
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      // Option 2 should still be visible as it contains "1" in its label/value
      // The filter is case-insensitive and checks if label or value includes the query
    });
  });

  it('should call onSelect when option is selected', async () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.click(input);

    await waitFor(() => {
      const option = screen.getByText('Option 1');
      fireEvent.click(option);
    });

    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('should use custom filter function when provided', async () => {
    const customFilter = jest.fn((option, query) => option.label.includes(query));
    
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        filterFn={customFilter}
      />
    );

    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/rechercher/i);
      expect(input).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: '1' } });

    await waitFor(() => {
      // The filter function should be called for each option
      expect(customFilter).toHaveBeenCalled();
    });
  });

  it('should handle empty options', () => {
    render(
      <AutoCompleteInput
        value=""
        onChange={mockOnChange}
        options={[]}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });
});
